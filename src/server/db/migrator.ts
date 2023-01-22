import path from "path";
import fs from "fs";
import {Version, parseVersion, compareVersions} from "../versions";

const baseMigrationPath = path.join(__dirname, "./migrations");

export function getMigrations(version:string):Array<string> {
    const migrationFiles = fs.readdirSync(baseMigrationPath);
    return migrationFiles.map(m => m.replace(".js", "")).filter(m => compareVersions(m, version)).sort((a, b) => compareVersions(a, b) ? 1 : -1);
}

export function getMigrationName(migration:string):string {
    return migration.indexOf(".js") >= 0 ? migration : `${migration}.js`;
}

export async function getMigration(migration:string) {
    return await import(path.join(baseMigrationPath, getMigrationName(migration)));
}