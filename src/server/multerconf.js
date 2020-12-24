const path = require("path");
const multer = require("multer");
const {customAlphabet} = require("nanoid");
const nanoid = customAlphabet("0123456789abcdef", 6);

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

module.exports = {storage, fileFilter};