import {getConfig, config} from "./scripts/networking";
import {stopLoading, setupUI} from "./scripts/menu";

import "./css/css";
import "./css/global.css"
import "./css/icons.css"

Promise.all([
    getConfig
]).then(() => {
    console.log(config);
    setupUI();
    stopLoading();
});