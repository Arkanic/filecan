import { config, sendData } from "./networking";

export const stopLoading = () => {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("content").classList.remove("hidden");
}

export const setupMenu = () => {
    if (!config.requirePassword) {
        document.getElementById("passwordbox").classList.add("hidden");
    }
}

export const startFormListener = () => {
    let form = document.getElementById("form");
    let xhr;

    document.getElementsByTagName("body")[0].addEventListener("keypress", e => {
        if(e.key == "Enter") document.getElementById("submitbutton").click();
    });

    document.getElementById("submitbutton").onclick = () => {
        let formData = new FormData(form);
        console.log(formData.get("expirylength"));
        let action = "/api/upload";
        xhr = sendData(formData, action, loadStart, progress, load, readyStateChange);

        return false;
    }

    let progressbox = document.getElementById("progressbox");
    let progressbar = document.getElementById("progressbar");
    let progressinfo = document.getElementById("progressinfo");

    let loading = document.getElementById("loading");
    let content = document.getElementById("content");

    let results = document.getElementById("results");

    let dpsc;
    let last = 0;
    let now = 0;
    let dif;

    function loadStart(evt) {
        progressbox.classList.remove("hidden");
        dpsc = setInterval(() => {
            dif = now - last;
            last = now;
        }, 1000);
    }

    function progress(evt) {
        now = evt.loaded;
        let progress = evt.loaded / evt.total * 100;
        progressbar.value = progress;

        progressinfo.innerHTML = `
        %${progress.toFixed(2)}
        ${(evt.loaded / 1024 / 1024).toFixed(2)}mb/${(evt.total / 1024 / 1024).toFixed(2)}mb
        ${(dif / 1024 / 1024).toFixed(2)}mb/s
        ETA ${((evt.total - evt.loaded) / dif).toFixed(2)}s
        `;
    }

    function load(evt) {
        progressbox.classList.add("hidden");
        content.classList.add("hidden");
        loading.classList.remove("hidden");
    }

    function readyStateChange(evt, xhr) {
        if(xhr.readyState != 4) return;
        let json = JSON.parse(xhr.responseText);
        loading.classList.add("hidden");
        results.classList.remove("hidden");
        if(json.success) {
            for(let i in json.files) {
                let itemdiv = document.createElement("div");
                let filename = document.createElement("p");
                filename.appendChild(document.createTextNode(json.files[i].originalname));
                let link = `${window.location.protocol}//${window.location.host}/${json.files[i].filename}`;
                let linkParentElement = document.createElement("p");
                let linkElement = document.createElement("a");
                linkElement.target = "_blank";
                linkElement.href = link;
                linkElement.appendChild(document.createTextNode(link));
                linkParentElement.appendChild(linkElement);
                itemdiv.appendChild(filename);
                itemdiv.appendChild(linkParentElement);
                results.appendChild(itemdiv);
            }
        } else {
            let error = document.createElement("p");
            error.appendChild(document.createTextNode(json.message));
            results.appendChild(error);
        }
    }
}
