const path = require("path");
const multer = require("multer");
const {customAlphabet} = require("nanoid");
const nanoid = customAlphabet("0123456789abcdef", 4);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "upload");
    },
    filename: (req, file, cb) => {
        cb(null, (file.originalname + "-" + nanoid()).substring(0, 32) + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    cb(null, true);
}

module.exports = {storage, fileFilter};