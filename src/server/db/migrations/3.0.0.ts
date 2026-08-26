import {Knex} from "knex";
import fs from "fs";
import path from "path";
import {getConfig} from "../../config";

export const up = (schema:Knex.SchemaBuilder, db:Knex) => {
    const config = getConfig();
    fs.mkdirSync(path.join(config.filecanDataPath, "files"));
}

export const down = (schema:Knex.SchemaBuilder, db:Knex) => {};