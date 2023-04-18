import {Knex} from "knex";

export const up = (schema:Knex.SchemaBuilder, db:Knex) => {
    return schema.alterTable("files", table => {
        table.string("data");
    });
}

export const down = (schema:Knex.SchemaBuilder, db:Knex) => {};