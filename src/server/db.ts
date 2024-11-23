import * as knex from "knex";
import fs from "fs";
import path from "path";
import config from "./config";

import {getMigration, getMigrations} from "./db/migrator";

const VERSION = "3.0.0";

export default ():Promise<knex.Knex<any, unknown[]>> => {
    return new Promise((resolve, reject) => {
        if(!fs.existsSync(config.filecanDataPath)) fs.mkdirSync(config.filecanDataPath);

        let db:knex.Knex<any, unknown[]> | PromiseLike<knex.Knex<any, unknown[]>>;
        if(process.env.PG_URL) {
            console.log("Using pg (external)");
            db = knex.default({
                client: "pg",
                connection: process.env.PG_URL
            });
        } else { 
            console.log("Using sqlite (internal)");
            db = knex.default({
                client: "better-sqlite3",
                connection: {
                    filename: path.join(config.filecanDataPath, "filecan.db")
                },
                useNullAsDefault: true
            });
        }

        initdb(db).then((_) => {
            resolve(db);
        });
    });
}

function readVersion():string {
    return fs.readFileSync(path.join(config.filecanDataPath, "version")).toString();
}

function createVersion(version:string):void {
    fs.writeFileSync(path.join(config.filecanDataPath, "version"), version);
}

export async function initdb(db:knex.Knex<any, unknown[]>):Promise<knex.Knex.SchemaBuilder> {

    let version = "0.0.0";
    if(await db.schema.hasTable("files")) {
        version = readVersion();
    }

    let migrations = getMigrations(version);
    for(let i in migrations) {
        console.log(`Upgrading to ${migrations[i]}`);
        let migration = await getMigration(migrations[i]);
        await migration.up(db.schema, db);
    }

    createVersion(VERSION);

    return db.schema;
}

export class DbConnection {
    db:knex.Knex<any, unknown[]>;

    constructor(db:knex.Knex<any, unknown[]>) {
        this.db = db;
    }

    async getById(table:string, id:number | string):Promise<any> {
        let [result] = await this.db(table).select().where("id", id);
        return result;
    }

    async insert(table:string, content:any):Promise<number> {
        let [id] = await this.db(table).insert(content);
        return id;
    }

    async updateById(table:string, id:number | string, content:any) {
        await this.db(table).update(content).where("id", id);
    }

    async deleteById(table:string, id:number | string) {
        await this.db(table).del().where("id", id);
    }
}