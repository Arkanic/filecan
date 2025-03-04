import path from "path";
import fs from "fs";
import express from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import database, {DbConnection} from "./db";
import SessionManager, {Session} from "./session";
import {hasPermission} from "./permissions";
import Permission from "../shared/types/permission";
import Logger, {deleteLogs} from "./log";
import {getIP} from "./ip";
import {storage, fileFilter} from "./middleware/multerconf";
import auth from "./middleware/auth";
import config from "./config";
import {WebConfigSuccess} from "../shared/types/webconfig";
import FileMetadata from "../shared/types/filemetadata";
import {WebFile} from "../shared/types/webfiles";
import AuthRequest from "../shared/types/request/authrequest";
import randomString from "./util/genrandom";

const instanceHash = randomString(32);

database().then(db => {
    let dbc = new DbConnection(db);

    const logger = new Logger(db, "main");
    logger.log("Starting filecan...");
    logger.log("Database loaded...");

    const sessions = new SessionManager(1000 * 60 * 60 * 24 * 7 * 2); // 2 weeks

    const app = express();
    app.set("trust proxy", true);

    app.use([
        require("cors")(),
        express.json(),
        express.static(config.staticFilesPath),
        (req:express.Request, res:express.Response, next:express.NextFunction) => {
            res.locals.db = db;
            next();
        }
    ]);

    const upload = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: config.maxFilesizeMegabytes * 1000 * 1000
        }
    });

    app.post("/api/auth/authenticate", (req, res, next) => {
        if((!req.body.type || !req.body.password) && !(typeof(req.body.type) == "string" && typeof(req.body.password) == "string")) return res.status(400).json({
            success: false,
            message: "Invalid body format"
        });

        const body:AuthRequest = req.body;

        let requestedPermission = Permission.None;
        if(body.type == "upload") requestedPermission = Permission.Upload;
        else if(body.type == "admin") requestedPermission = Permission.Admin;
        else return res.status(400).json({
            success: false,
            message: "Invalid body format"
        });

        // check password
        let grantedPermission = Permission.None;
        if(hasPermission(requestedPermission, Permission.Upload) && config.requirePassword) {
            if(!bcrypt.compareSync(body.password, config.password)) {
                res.status(400).json({
                    success: false,
                    message: "Incorrect password"
                });
                return logger.warn(`[auth fail] [fail] ${getIP(req)} attempted upload access, incorrect password`);
            }

            grantedPermission |= Permission.Upload;
        } else if(hasPermission(requestedPermission, Permission.Upload) && !config.requirePassword) {
            grantedPermission |= Permission.Upload;
        } else if(hasPermission(requestedPermission, Permission.Admin)) {
            if(!bcrypt.compareSync(body.password, config.adminPassword)) {
                res.status(400).json({
                    success: false,
                    message: "Incorrect password"
                });
                return logger.warn(`[auth fail] [fail] ${getIP(req)} attempted admin access, incorrect password`);
            }

            grantedPermission |= Permission.Admin;
        }

        let session:Session;
        if(req.body.token && typeof(req.body.token) == "string") {
            session = sessions.get(req.body.token);
            if(!session) return res.json({
                success: false,
                message: "Invalid token"
            });
        } else {
            let token = sessions.add(Permission.None);
            session = sessions.get(token) as Session;
        }

        session.permissions |= grantedPermission;
        session.interactionObserved();

        res.status(200).json({
            success: true,
            token: session.token,
            expires: session.expiry.getTime(),
            grantedPermissions: session.permissions
        });
    });

    app.post("/api/upload", (req, res, next) => {
        auth(req, res, next, sessions, false);
    }, upload.any(), async (req, res, next) => {
        let expiryLength = 1000 * 60 * 60 * 24; // 24 hours
        if(req.body.expirylength)
            if(typeof req.body.expirylength === "string")
                expiryLength = parseInt(req.body.expirylength); // < 0 means do not expire

        try {
            let {files} = req;
            let serializedFiles:Array<FileMetadata> = [];

            for(let i in files) {
                let file:Express.Multer.File = (files as unknown as any)[i];
                serializedFiles.push({
                    originalname: file.originalname,
                    filename: file.filename
                });

                let stat = fs.statSync(file.path);

                await dbc.insert("files", {
                    created: Date.now(),
                    expires: (expiryLength > 0) ? Date.now() + expiryLength : 0, // if negative make it not expire
                    original_filename: file.originalname,
                    filename: file.filename,
                    filesize: stat.size,
                    views: 0
                });
                fs.copyFileSync(file.path, path.join(config.filecanDataPath, "files/", file.filename));
            }

            res.status(201).json({
                success: true,
                message: "File uploaded successfully",
                files: serializedFiles
            });
            for (let i in serializedFiles) {
                let file = serializedFiles[i];
                logger.log(`[upload] ${getIP(req)} successfully uploaded "${file.originalname}" as "${file.filename}", expiry is ${(expiryLength < 0) ? "never" : "in " + (expiryLength / 60 / 60 / 1000).toFixed(1) + " hours"}`);
            }
            return next();
        } catch (error) {
            logger.log(JSON.stringify(error));
            return res.status(500).json({
                success: false,
                messsage: "Internal server error."
            });
        }
    });

    app.post("/api/config", (req, res) => {
        let webconfig:WebConfigSuccess = {
            success: true,
            requirePassword: config.requirePassword,
            maxFilesizeMegabytes: config.maxFilesizeMegabytes,
            instanceHash
        }
        if(config.customURLPath) webconfig.customURLPath = config.customURLPath;

        return res.status(200).json(webconfig);
    });

    app.post("/api/admin/logs", (req, res, next) => {
        auth(req, res, next, sessions, true);
    }, async (req, res) => {
        let logs;
        if(req.body && req.body.hasOwnProperty("minimumtime")) {
            logs = await db("log").where("time", ">", parseInt(req.body.minimumtime));
        } else logs = await db("log").select("*");
        res.status(200).json({
            success: true,
            logs: logs.map(x => {return {time: x.time, author: x.author, color: x.color, content: x.content}})
        });
    });

    app.post("/api/admin/deletelogs", (req, res, next) => {
        auth(req, res, next, sessions, true);
    }, async (req, res) => {
        let timeoffset = 0;
        if(req.body && req.body.hasOwnProperty("timeoffset")) timeoffset = parseInt(req.body.timeoffset);

        await deleteLogs(db, timeoffset);
        logger.log(`[admin] cleared all logs after ${new Date(Date.now() - timeoffset).toString()}`);

        res.status(200).json({
            success: true
        });
    });

    app.post("/api/admin/files", (req, res, next) => {
        auth(req, res, next, sessions, true);
    }, async (req, res) => {
        let files = await db("files").select("*");

        let serializedFiles:Array<WebFile> = [];
        for(let i in files) {
            let file = files[i];

            serializedFiles.push({
                created: file.created,
                expires: file.expires,
                file: {
                    originalname: file.original_filename,
                    filename: file.filename
                },
                filesize: file.filesize,
                views: file.views
            });
        }

        res.status(200).json({
            success: true,
            files:serializedFiles
        });
    });

    app.post("/api/admin/delete", (req, res, next) => {
        auth(req, res, next, sessions, true);
    }, async (req, res) => {
        if(!req.body || (req.body && !req.body.filename)) return res.status(400).json({
            success: false,
            message: "Bad request"
        });

        let results = await db("files").where("filename", req.body.filename);
        if(results.length < 1) return res.status(400).json({
            success: false,
            message: "File does not exist"
        });

        await db("files").del().where("filename", req.body.filename);
        fs.unlinkSync(path.join(config.filecanDataPath, "files", req.body.filename));

        res.status(200).json({
            success: true
        });

        logger.log(`[admin] deleted ${req.body.filename}`);
    });

    if(config.hostStaticFiles) app.get("*", async (req, res) => {
        let filename = path.basename(req.path);

        if(!fs.existsSync(path.join(config.filecanDataPath, "files/", filename))) {
            res.status(404).send("not found");
            logger.log(`[serve] 404 ${getIP(req)} ${filename}`);
            return;
        }
        res.status(200).sendFile(path.join(__dirname, "../../", config.filecanDataPath, "files/", filename));
        logger.log(`[serve] 200 ${getIP(req)} ${filename}`)

        await dbc.db.table("files").update({views: dbc.db.raw("?? + ?", ["views", 1])}).where("filename", filename);
    });

    app.listen(config.port, () => logger.log("Listener online"));

    async function purgeExpiredFiles(dbc:DbConnection) {
        // get all files where current time is above expiry time, excluding those where expiry time is never
        let files = await dbc.db.table("files").where("expires", "<", Date.now()).andWhereNot("expires", 0);
        for(let file of files) {
            logger.log(`Deleted expired file ${file.filename} (${file.original_filename})`);
            fs.unlinkSync(path.join(config.filecanDataPath, "files", file.filename));
            await dbc.deleteById("files", file.id);
        }
    }

    setInterval(() => {
        purgeExpiredFiles(dbc);
    }, 1000 * 60 * 60); // check every hour
    purgeExpiredFiles(dbc);
});