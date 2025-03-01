import path from "path";
import multer from "multer";
import randomString from "../util/genrandom";

export const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, randomString(6) + path.extname(file.originalname));
    },
    
});
export const fileFilter = (req:any, file:any, cb:any) => {
    if(req.path == "/api/upload") cb(null, true);
    else cb(null, false);
}