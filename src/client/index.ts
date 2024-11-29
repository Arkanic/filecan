import {getConfig, config} from "./scripts/networking";
import {stopLoading, setupUI} from "./scripts/menu";

import "./css/global.css"

Promise.all([
    getConfig
]).then(() => {
    console.log(config);
    setupUI();
    stopLoading();
});