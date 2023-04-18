import path from "path";
import fs from "fs";
import express from "express";
import multer from "multer";
import database, { DbConnection } from "./db";
import Logger from "./log";

const config = require("../config");

database().then(db => {
    let dbc = new DbConnection(db);

    const logger = new Logger(db, "main");
    logger.log("Starting filecan...");
    logger.log("Database loaded...");

    const app = express();
    app.set("trust proxy", true);

    app.use([
        require("cors")(),
        express.static(__dirname + "/../dist/"),
        express.static(__dirname + "/../dist/index"),
        express.static(__dirname + "/../public"),
        (req:express.Request, res:express.Response, next:express.NextFunction) => {
            res.locals.db = db;
            next();
        }
    ]);

    app.use("admin", express.static(__dirname + "/../dist/admin"));

    const {storage, fileFilter} = require("./middleware/multerconf");
    const upload = multer({ storage, fileFilter });
    const auth = require("./middleware/auth");

    app.post("/api/upload", (req, res, next) => {
        auth(req, res, next, false);
    }, upload.any(), async (req, res, next) => {
        let expiryLength = 1000 * 60 * 60 * 24; // 24 hours
        if(req.body.expirylength)
            if(typeof req.body.expirylength === "string")
                expiryLength = parseInt(req.body.expirylength); // < 0 means do not expire

        try {
            let {files} = req;
            for(let i in files) {
                let file:Express.Multer.File = (files as unknown as any)[i];

                await dbc.insert("files", {
                    created: Date.now(),
                    expires: (expiryLength > 0) ? Date.now() + expiryLength : 0, // if negative make it not expire
                    original_filename: file.originalname,
                    filename: file.filename,
                    filesize: file.size,
                    data: fs.readFileSync(file.path),
                    views: 0
                });
            }

            res.status(201).json({
                success: true,
                message: "File uploaded successfully",
                files: req.files
            });
            for (let i in req.files) {
                let file = (files as unknown as any)[i] as unknown as any;
                logger.log(`${req.ip} successfully uploaded "${file.originalname}" as "${file.filename}", expiry is ${(expiryLength < 0) ? "never" : "in " + (expiryLength / 60 / 60 / 1000).toFixed(1) + " hours"}`);
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
        return res.status(200).json({
            requirePassword: config.requirePassword
        });
    });

    app.post("/api/admin/logs", (req, res, next) => {
        auth(req, res, next, true);
    }, async (req, res, next) => {
        let logs;
        if(req.body)
            if(req.body.hasOwnProperty("minimumtime")) logs = await db("log").where("time", ">", parseInt(req.body.minimumtime));
            else logs = await db("log").select("*");
        else logs = await db("log").select("*");
        res.status(200).json({
            success: true,
            logs: logs.map(x => {return {time: x.time, author: x.author, color: x.color, content: x.content}})
        });
    });

    app.get("*", async (req, res) => {
        let filename = path.basename(req.path);

        let files = await dbc.db("files").select().where("filename", filename);
        if(files.length < 1) res.status(404).send("not found");
        res.status(200).send(files[0].data);

        await dbc.db.table("files").update({views: dbc.db.raw("?? + ?", ["views", 1])}).where("filename", filename);
    });

    app.listen(config.port, () => logger.log("Listener online"));

    async function purgeExpiredFiles(dbc:DbConnection) {
        // get all files where current time is above expiry time, excluding those where expiry time is never
        let files = await dbc.db.table("files").where("expires", "<", Date.now()).andWhereNot("expires", 0);
        for(let file of files) {
            logger.log(`Deleted expired file ${file.filename} (${file.original_filename})`);
            fs.unlinkSync(path.join(__dirname, "../data/upload", file.filename));
            await dbc.deleteById("files", file.id);
        }
    }

    setInterval(() => {
        purgeExpiredFiles(dbc);
    }, 1000 * 60 * 60); // check every hour
    purgeExpiredFiles(dbc);
});