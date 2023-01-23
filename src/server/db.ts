import * as knex from "knex";
import fs from "fs";

import {getMigration, getMigrations} from "./db/migrator";

const DATA_DIR = "data";
const VERSION = "2.1.0";

export default ():Promise<knex.Knex<any, unknown[]>> => {
    return new Promise((resolve, reject) => {
        if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

        let db = knex.default({
            client: "better-sqlite3",
            connection: {
                filename: `./${DATA_DIR}/filecan.db`
            },
            useNullAsDefault: true
        });

        initdb(db).then((_) => {
            resolve(db);
        });
    });
}

function readVersion():string {
    return fs.readFileSync(`./${DATA_DIR}/version`).toString();
}

function createVersion(version:string):void {
    fs.writeFileSync(`./${DATA_DIR}/version`, version);
}

export async function initdb(db:knex.Knex<any, unknown[]>):Promise<knex.Knex.SchemaBuilder> {
    let {schema} = db;
    let version = "0.0.0";
    if(await schema.hasTable("files")) {
        version = readVersion();
    }

    let migrations = getMigrations(version);
    for(let i in migrations) {
        console.log(`Upgrading to ${migrations[i]}`);
        let migration = await getMigration(migrations[i]);
        schema = await migration.up(schema, db);
    }

    createVersion(VERSION);

    return schema;
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