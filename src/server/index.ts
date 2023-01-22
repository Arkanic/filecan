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
                    expires: Date.now() + (1000 * 60 * 60 * 6),
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
                console.log(`Successfully uploaded "${file.originalname}" as "${file.filename}"`);
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
});