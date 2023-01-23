import path from "path";
import fs from "fs";
import express from "express";
import multer from "multer";
import database, { DbConnection } from "./db";

const config = require("../config");

database().then(db => {
    let dbc = new DbConnection(db);

    const app = express();
    app.use([
        require("cors")(),
        express.static(__dirname + "/../dist"),
        express.static(__dirname + "/../public")
    ]);

    const {storage, fileFilter} = require("./middleware/multerconf");
    const upload = multer({ storage, fileFilter });
    const auth = require("./middleware/auth");

    app.post("/api/upload", (req, res, next) => {
        auth(req, res, next);
    }, upload.any(), async (req, res, next) => {
        let expiryLength = 1000 * 60 * 60 * 24; // 24 hours
        if(req.body.expirylength)
            if(typeof req.body.expirylength === "string")
                expiryLength = parseInt(req.body.expirylength); // < 0 means do not expire

        try {
            let {files} = req;
            if (!files) throw new Error("no files found");
            if (files.length <= 0) return res.status(401).json({
                success: false,
                message: "No files uploaded"
            });

            for(let i in files) {
                let file:Express.Multer.File = (files as unknown as any)[i];

                await dbc.insert("files", {
                    created: Date.now(),
                    expires: (expiryLength > 0) ? Date.now() + expiryLength : 0, // if negative make it not expire
                    original_filename: file.originalname,
                    filename: file.filename,
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
                console.log(`Successfully uploaded "${file.originalname}" as "${file.filename}", expiry is ${(expiryLength < 0) ? "never" : "in " + (expiryLength / 60 / 60 / 1000).toFixed(1) + " hours"}`);
            }
            return;
        } catch (error) {
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

    app.get("*", async (req, res) => {
        let filename = path.basename(req.path);
        let file = path.join(__dirname, "/../upload", filename);
        if(file === "..") return res.status(403).send("🤓");

        if(!fs.existsSync(file)) return res.status(404).send("File not found");
        res.status(200).sendFile(file);

        await dbc.db.table("files").update({views: dbc.db.raw("?? + ?", ["views", 1])}).where("filename", filename);
    });

    app.listen(config.port, () => console.log("Listener online"));


    // delete expired files
    function expired(expires:number):boolean {
        return Date.now() > expires;
    }

    async function purgeExpiredFiles(dbc:DbConnection) {
        // get all files where current time is above expiry time, excluding those where expiry time is never
        let files = await dbc.db.table("files").where("expires", "<", Date.now()).andWhereNot("expires", 0);
        for(let file of files) {
            console.log(`Deleted expired file ${file.filename} (${file.original_filename})`);
            fs.unlinkSync(path.join(__dirname, "../upload", file.filename));
            await dbc.deleteById("files", file.id);
        }
    }

    setInterval(() => {
        purgeExpiredFiles(dbc);
    }, 1000 * 60 * 60); // check every hour
    purgeExpiredFiles(dbc);
});