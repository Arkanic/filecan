import fs from "fs";
import yaml from "yaml";

/**
 * Configuration file format
 */
export interface Config {
    requirePassword:boolean;

    password:string;
    adminPassword:string;

    port:string | number;

    reverseProxy:boolean;

    maxFilesizeMegabytes:number
}

/**
 * Parse YAML configuration file
 * 
 * @param path path configuration file is located at. Optional, defaults to "./config.yml"
 * @returns Configuration object
 */
export function getConfig(path?:string):Config {
    let configurationPath = path ? path : "./config.yml";
    if(!fs.existsSync(configurationPath)) throw new Error("Configuration file not found!");

    let rawConfig = yaml.parse(fs.readFileSync(configurationPath).toString());

    // TODO: proper type checking?
    return rawConfig as any as Config;
}

const config = getConfig();
export default config;