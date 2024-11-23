import express from "express";
import config from "./config";

export function getIP(req:express.Request) {
    if(!config.reverseProxy) return req.socket.remoteAddress;
    else return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
}