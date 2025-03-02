import * as express from "express";
import SessionManager from "../session";
import {hasPermission} from "../permissions";
import Permission from "../../shared/types/permission";
import Logger from "../log";
import {getIP} from "../ip";

export default function auth(req:express.Request, res:express.Response, next:express.NextFunction, sessions:SessionManager, admin:boolean) {
    let logger = new Logger(res.locals.db, "auth");

    if(!(req.headers.token && typeof(req.headers.token) == "string")) {
        logger.warn(`[auth fail] [malformed] ${getIP(req)} attempted access, malformed request`);
        return res.status(400).json({
            success: false,
            message: "Malformed request"
        });
    }

    let token = req.headers.token;
    let session = sessions.get(token);
    if(!session) {
        logger.warn(`[auth fail] [malformed] ${getIP(req)} attempted access, malformed request`);
        return res.status(400).json({
            success: false,
            message: "Invalid token"
        });
    }
    session.interactionObserved();

    const permissions = session.permissions;
    if(admin) {
        if(hasPermission(permissions, Permission.Admin)) return next();
    } else {
        if(hasPermission(permissions, Permission.Upload)) return next();
    }

    // insufficient permissions
    logger.warn(`[auth fail] [permission] ${getIP(req)} attempted access, insufficient permissions for ${admin ? "admin" : "upload"}`);
    return res.status(400).json({
        success: false,
        message: "Insufficient permissions"
    });
}