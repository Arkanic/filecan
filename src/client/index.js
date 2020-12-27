import {getConfig, config} from "./scripts/networking";
import {stopLoading, setupMenu, startFormListener} from "./scripts/menu";

import "./css/global.css"

Promise.all([
    getConfig
]).then(() => {
    console.log(config);
    setupMenu();
    stopLoading();
    startFormListener();
});