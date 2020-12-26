import {getConfig, returnConfig} from "./scripts/networking";
import {stopLoading, setupMenu} from "./scripts/menu";

import "./css/global.css"

let config;

Promise.all([
    getConfig
]).then(() => {
    config = returnConfig();
    console.log(config);
    setupMenu();
    stopLoading();
})