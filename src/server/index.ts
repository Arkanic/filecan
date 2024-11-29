import path from "path";
import fs from "fs";
import express from "express";
import multer from "multer";
import database, { DbConnection } from "./db";
import Logger from "./log";
import {getIP} from "./ip";
import {storage, fileFilter} from "./middleware/multerconf";
import auth from "./middleware/auth";
import config from "./config";
import WebConfig from "../shared/types/webconfig";
import FileMetadata from "../shared/types/filemetadata";
import {WebFile} from "../shared/types/webfiles";

database().then(db => {
    let dbc = new DbConnection(db);

    const logger = new Logger(db, "main");
    logger.log("Starting filecan...");
    logger.log("Database loaded...");

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

    app.post("/api/upload", (req, res, next) => {
        auth(req, res, next, false);
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
                logger.log(`upload ${getIP(req)} successfully uploaded "${file.originalname}" as "${file.filename}", expiry is ${(expiryLength < 0) ? "never" : "in " + (expiryLength / 60 / 60 / 1000).toFixed(1) + " hours"}`);
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

    app.get("/api/config", (req, res) => {
        let webconfig:WebConfig = {
            requirePassword: config.requirePassword,
            maxFilesizeMegabytes: config.maxFilesizeMegabytes
        }
        if(config.customURLPath) webconfig.customURLPath = config.customURLPath;

        return res.status(200).json(webconfig);
    });

    app.post("/api/admin/logs", (req, res, next) => {
        auth(req, res, next, true);
    }, async (req, res) => {
        let logs;
        if(req.body && req.body.hasOwnProperty("minimumtime")) {
            logs = await db("log").where("time", ">", parseInt(req.body.minimumtime));
        }
        else logs = await db("log").select("*");
        res.status(200).json({
            success: true,
            logs: logs.map(x => {return {time: x.time, author: x.author, color: x.color, content: x.content}})
        });
    });

    app.post("/api/admin/files", (req, res, next) => {
        auth(req, res, next, true);
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