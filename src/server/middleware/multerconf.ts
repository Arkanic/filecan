import path from "path";
import multer from "multer";
import {customAlphabet} from "nanoid";
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "upload");
    },
    filename: (req, file, cb) => {
        cb(null, nanoid() + path.extname(file.originalname));
    },
});
const fileFilter = (req:any, file:any, cb:any) => {
    if(req.path == "/api/upload") cb(null, true);
    else cb(null, false);
}

module.exports = {storage, fileFilter};