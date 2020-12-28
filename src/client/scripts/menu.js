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

    let progressbox = document.getElementById("progressbox");
    let progressbar = document.getElementById("progressbar");
    let progressinfo = document.getElementById("progressinfo");

    let loading = document.getElementById("loading");
    let content = document.getElementById("content");

    function loadStart(evt) {
        progressbox.classList.remove("hidden");
    }

    function progress(evt) {
        let progress = evt.loaded/evt.total*100;
        progressbar.value=progress;
        
        progressinfo.innerHTML = `%${progress.toFixed(2)} - ${(evt.loaded/1024/1024).toFixed(2)}mb/${(evt.total/1024/1024).toFixed(2)}mb`;
    }

    function load(evt) {
        progressbox.classList.add("hidden");
        content.classList.add("hidden");
        loading.classList.remove("hidden");
    }

    function readyStateChange(evt) {
        loading.classList.add("hidden");
    }
}