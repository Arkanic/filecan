import {Knex} from "knex";

const timeToLive = 1000 * 60 * 60 * 24 * 7; // logs last 1 week

export default class Logger {
    db:Knex;
    author:string;

    constructor(db:Knex, author:string) {
        this.db = db;
        this.author = author;

        this.checkExpiry();
        setInterval(() => {
            this.checkExpiry();
        }, 1000 * 60 * 60); // check every hour
    }

    checkExpiry() {
        this.db("log").delete().where("time", "<", Date.now() - timeToLive).then(() => {});
    }

    message(color:string, content:string) {
        this.db("log").insert({time: Date.now(), author: this.author, color, content}).then(() => {
            displayMessage(this.author, color, content);
        });
    }

    log(content:string) {
        this.message("white", content);
    }

    error(content:string) {
        this.message("red", content);
    }

    warn(content:string) {
        this.message("yellow", content);
    }

    success(content:string) {
        this.message("green", content);
    }
}

let colors:{[unit:string]:string} = {
    "white": "\x1b[37m",
    "red": "\x1b[31m",
    "yellow": "\x1b[33m",
    "green": "\x1b[32m",
    "reset": "\x1b[0m"
}

export function displayMessage(author:string, color:string, content:string) {
    console.log(`[${author}] ${colors[color]}${content}${colors["reset"]}`);
}

export async function deleteLogs(db:Knex, minTime:number) {
    await db("log").delete().where("time", ">", minTime);
}