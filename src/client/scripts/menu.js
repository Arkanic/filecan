import {config, sendData} from "./networking";

export const stopLoading = () => {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("content").classList.remove("hidden");
}

export const setupMenu = () => {
    if(!config.requirePassword) {
        document.getElementById("passwordbox").classList.add("hidden");
    }
}

export const startFormListener = () => {
    let form = document.getElementById("form");
    document.getElementById("submitbutton").onclick = () => {
        let formData = new FormData(form);
        let action = form.getAttribute("action");
        sendData(formData, action, loadStart, progress, load, readyStateChange);

        return false;
    }

    function loadStart(e) {
    }

    function progress(e) {
    }

    function load(e) {
    }

    function readyStateChange(e) {
    }
}