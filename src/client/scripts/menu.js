import {config} from "./networking";

export const stopLoading = () => {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("content").classList.remove("hidden");
}

export const setupMenu = () => {
    if(!config.requirePassword) {
        document.getElementById("passwordbox").classList.add("hidden");
    }
}