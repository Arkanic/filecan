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

    maxFilesizeMegabytes:number;
    filecanDataPath:string;
    staticFilesPath:string;
    hostStaticFiles:boolean;
    customURLPath?:string;
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

    const rawConfig = yaml.parse(fs.readFileSync(configurationPath).toString());
    const config = rawConfig as any as Config;

    if(!config.hostStaticFiles && !config.customURLPath) console.warn("Filecan is configured not to serve uploaded files, but no file URL has been served. Is this intentional?");
    if(config.hostStaticFiles && config.customURLPath) console.warn("Filecan is configured to link to a different path with the uploaded files, but is also configured to host files on the client address. Is this intentional?");

    // TODO: proper type checking?
    return config;
}

const config = getConfig();
export default config;