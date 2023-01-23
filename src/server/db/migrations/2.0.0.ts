import {Knex} from "knex";

export const up = (schema:Knex.SchemaBuilder, db:Knex) => {
    return schema.createTable("files", table => {
        table.increments("id").primary();
        table.bigInteger("created").unsigned();
        table.bigInteger("expires").unsigned();
        table.string("original_filename");
        table.string("filename");
        table.bigInteger("views").unsigned();
    });
}


export const down = (knex:Knex) => {}