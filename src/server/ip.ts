import express from "express";
import {reverseProxy} from "../../config";

export function getIP(req:express.Request) {
    if(!reverseProxy) return req.socket.remoteAddress;
    else return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
}