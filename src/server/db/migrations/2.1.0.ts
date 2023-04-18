import {Knex} from "knex";
import fs from "fs";
import path from "path";

export const up = async (schema:Knex.SchemaBuilder, db:Knex) => {

    let newSchema = schema.alterTable("files", table => {
        table.bigInteger("filesize").unsigned().defaultTo(0);
    });

    return newSchema;
}

export const down = (schema:Knex.SchemaBuilder, db:Knex) => {};