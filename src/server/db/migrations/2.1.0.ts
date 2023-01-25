import {Knex} from "knex";
import fs from "fs";
import path from "path";

export const up = async (schema:Knex.SchemaBuilder, db:Knex) => {

    let newSchema = schema.alterTable("files", table => {
        table.bigInteger("filesize").unsigned().defaultTo(0);
    });

    let uploadDir = path.join(__dirname, "../../../", "upload");
    let files = fs.readdirSync(uploadDir);
    for(let i = 0; i < files.length; i++) {
        let file = files[i];
        if(file === "default") continue;
        
        let filePath = path.join(uploadDir, file);
        let fileDetails = fs.statSync(filePath);
        console.log(`${i}: ${filePath}, ${fileDetails.size}b`);

        await db("files").update({filesize: fileDetails.size}).where("filename", file);
    }

    return newSchema;
}

export const down = (schema:Knex.SchemaBuilder, db:Knex) => {};