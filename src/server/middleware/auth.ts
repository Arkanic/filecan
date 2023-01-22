import * as express from "express";
import bcrypt from "bcrypt";
const config = require("../../config");

function auth(req:express.Request, res:express.Response, next:express.NextFunction) {
    if(!config.requirePassword) return next();
    let password = req.headers.password;
    if(!password) {
        res.status(400).json({
            success: false,
            message: "Password is missing"
        });
        console.log("Attempted upload, password missing");
    } else if(typeof password === "object") {
        res.status(400).json({
            success: false,
            message: "Send password once only"
        });
    } else {
        bcrypt.compare(password, config.password, (err, matches) => {
            if(err) throw err;
            if(matches) next();
            else {
                res.status(401).json({
                    success: false,
                    message: "Incorrect password"
                });
                console.log("Attempted upload, incorrect password");
            }
        });
    }
}

module.exports = auth;