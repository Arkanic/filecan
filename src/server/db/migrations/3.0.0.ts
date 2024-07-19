import {Knex} from "knex";
import fs from "fs";

export const up = (schema:Knex.SchemaBuilder, db:Knex) => {
    fs.mkdirSync("data/files");
}

export const down = (schema:Knex.SchemaBuilder, db:Knex) => {};