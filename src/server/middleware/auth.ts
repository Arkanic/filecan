import * as express from "express";
import bcrypt from "bcrypt";
import Logger from "../log";
const config = require("../../config");

function auth(req:express.Request, res:express.Response, next:express.NextFunction, admin:boolean) {
    let logger = new Logger(res.locals.db, "auth");

    if(!config.requirePassword && !admin) return next();
    let password = req.headers.password;
    if(!password) {
        res.status(400).json({
            success: false,
            message: "Password is missing"
        });
        logger.warn("Attempted access, password missing");
    } else if(typeof password === "object") {
        res.status(400).json({
            success: false,
            message: "Send password once only"
        });
    } else {
        bcrypt.compare(password, admin ? config.adminPassword : config.password, (err, matches) => {
            if(err) throw err;
            if(matches) next();
            else {
                res.status(401).json({
                    success: false,
                    message: "Incorrect password"
                });
                logger.warn("Attempted access, incorrect password");
            }
        });
    }
}

module.exports = auth;