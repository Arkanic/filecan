import {getConfig, returnConfig} from "./scripts/networking"

import "./css/global.css"

let config;

Promise.all([
    getConfig()
]).then(() => {
    config = returnConfig();
})