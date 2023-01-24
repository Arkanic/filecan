import {Knex} from "knex";

export const up = (schema:Knex.SchemaBuilder, db:Knex) => {
    return schema.createTable("log", table => {
        table.bigInteger("time").unsigned();
        table.string("author");
        table.string("color");
        table.string("content");
    });
}

export const down = (schema:Knex.SchemaBuilder, db:Knex) => {};