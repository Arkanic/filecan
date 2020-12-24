const path = require("path");
const express = require("express");
const multer = require("multer");

const config = require("./config");

const app = express();
app.use([
    require("cors")(),
    express.static(__dirname + "/upload")
]);

const {storage, fileFilter} = require("./src/middleware/multerconf");
const upload = multer({storage, fileFilter});
const auth = require("./src/middleware/auth");

app.post("/api/upload", auth, upload.any(), (req, res, next) => {
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

app.listen(config.port, () => console.log("Listener online"));