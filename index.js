const path = require("path");
const express = require("express");
const multer = require("multer");

const {customAlphabet} = require("nanoid");
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

const app = express();
app.use(require("cors")());
const port = process.env.PORT || 8080;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "upload");
    },
    filename: (req, file, cb) => {
        cb(null, nanoid() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    cb(null, true);
}
const upload = multer({storage, fileFilter});

app.post("/api/upload", upload.any(), (req, res, next) => {
    try {
        return res.status(201).json({
            success: true,
            message: "File uploaded successfully",
            files: req.files
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            messsage: "Internal server error."
        });
        throw error;
    }
});

app.get("/", (req, res) => {
    res.status(200).send("Hi");
});

app.listen(port, () => console.log("Listener online"));