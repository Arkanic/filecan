import path from "path";
import multer from "multer";
import gid from "generate-unique-id";

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, gid({length: 6}) + path.extname(file.originalname));
    },
});
const fileFilter = (req:any, file:any, cb:any) => {
    if(req.path == "/api/upload") cb(null, true);
    else cb(null, false);
}

module.exports = {storage, fileFilter};