import {config, sendData, XHREvent} from "./networking";
import WebUpload from "../../../shared/types/webupload";
import WebLogs from "../../../shared/types/weblogs";
import WebFiles from "../../../shared/types/webfiles";

const elements = {
    body: document.getElementsByTagName("body")[0]! as HTMLBodyElement,
    loading: document.getElementById("loading")! as HTMLDivElement,
    content: document.getElementById("content")! as HTMLDivElement,
    results: document.getElementById("results")! as HTMLDivElement,
    passwordbox: document.getElementById("passwordbox")! as HTMLDivElement,
    password: document.getElementById("password")! as HTMLInputElement,
    form: document.getElementById("form")! as HTMLFormElement,
    submitbutton: document.getElementById("submitbutton")! as HTMLInputElement,
    progressbox: document.getElementById("progressbox")! as HTMLDivElement,
    progressbar: document.getElementById("progressbar")! as HTMLProgressElement,
    progressinfo: document.getElementById("progressinfo")! as HTMLParagraphElement,

    adminopen: document.getElementById("adminopen")! as HTMLAnchorElement,
    contentopen: document.getElementById("contentopen")! as HTMLAnchorElement,
    adminlogin: document.getElementById("adminlogin")!,
    adminpassword: document.getElementById("adminpassword")! as HTMLInputElement,
    adminsubmit: document.getElementById("adminsubmit")! as HTMLInputElement,

    admincontent: document.getElementById("admincontent")!,
    adminfilesbox: document.getElementById("adminfilesbox")!,
    adminlogbox: document.getElementById("adminlogbox")!
}

export const stopLoading = () => {
    elements.loading.classList.add("hidden");
    elements.content.classList.remove("hidden");
}

export const setupMenu = () => {
    if (!config.requirePassword) {
        elements.passwordbox.classList.add("hidden");
    }
}

export const startFormListener = () => {
    elements.body.addEventListener("keypress", e => {
        if(e.key == "Enter" && !elements.content.classList.contains("hidden")) elements.submitbutton.click();
    });

    document.getElementById("submitbutton")!.onclick = () => {
        let formData = new FormData(elements.form);
        sendData(formData, elements.password.value, "/api/upload", loadStart, progress, load, readyStateChange);

        return false;
    }

    let intervalID;
    let last = 0;
    let now = 0;
    let dif:number;

    function loadStart(e:Event):void {
        elements.progressbox.classList.remove("hidden");
        intervalID = setInterval(() => {
            dif = now - last;
            last = now;
        }, 1000);
    }

    function progress(e:XHREvent):void {
        now = e.loaded;
        let progress = e.loaded / e.total * 100;
        elements.progressbar.value = progress;

        elements.progressinfo.innerHTML = `
        %${progress.toFixed(2)}
        ${(e.loaded / 1024 / 1024).toFixed(2)}mb/${(e.total / 1024 / 1024).toFixed(2)}mb
        ${(dif / 1024 / 1024).toFixed(2)}mb/s
        ETA ${((e.total - e.loaded) / dif).toFixed(2)}s
        `;
    }

    function load(e:XHREvent):void {
        clearInterval(intervalID);
        elements.progressbox.classList.add("hidden");
        elements.content.classList.add("hidden");
        elements.loading.classList.remove("hidden");
    }

    function readyStateChange(e:XHREvent, xhr:XMLHttpRequest):void {
        if(xhr.readyState != 4) return;
        let json = JSON.parse(xhr.responseText) as WebUpload;

        elements.loading.classList.add("hidden");
        elements.results.classList.remove("hidden");

        if(json.success) {

            let resultsdiv = document.createElement("div");
            resultsdiv.classList.add("border");

            for(let i in json.files) {
                let itemdiv = document.createElement("div");
                itemdiv.classList.add("item-box");

                let filename = document.createElement("p");
                filename.appendChild(document.createTextNode(`${json.files[i].originalname}: `));

                let link = config.customURLPath ? config.customURLPath.replace("^s", json.files[0].filename) : `${window.location.protocol}//${window.location.host}/${json.files[i].filename}`;
                let linkElement = document.createElement("a");
                linkElement.target = "_blank";
                linkElement.href = link;
                linkElement.appendChild(document.createTextNode(link));

                filename.appendChild(linkElement);
                itemdiv.appendChild(filename);
                resultsdiv.appendChild(itemdiv);
            }

            elements.results.appendChild(resultsdiv);
        } else {
            let error = document.createElement("p");
            error.appendChild(document.createTextNode(json.message));
            elements.results.appendChild(error);
        }
    }
}

// admin mess

function getUploadedFiles() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/files", true);
    xhr.setRequestHeader("password", elements.adminpassword.value);
    xhr.onreadystatechange = () => {
        if(xhr.readyState != 4) return;

        let response = JSON.parse(xhr.responseText) as WebFiles;
        if(!response.success) return alert(`web error: ${response.message}`);

        let files = response.files;
        for(let i in files) {
            let file = files[i];

            let filediv = document.createElement("div");
            filediv.classList.add("item-box");

            let details = document.createElement("p");
            details.appendChild(document.createTextNode(`${file.file.originalname}: ${file.views} views, c: ${new Date(file.created).toString()} / e: ${new Date(file.expires).toString()}, ${(file.filesize / 1000 / 1000).toFixed(2)}mb`));

            filediv.appendChild(details);
            elements.adminfilesbox.appendChild(filediv);
        }

        if(files.length == 0) {
            let p = document.createElement("p");
            let i = document.createElement("i");
            i.appendChild(document.createTextNode("No files uploaded..."));
            p.appendChild(i);

            elements.adminfilesbox.appendChild(p);
        }
    }

    xhr.send();
}

function updateLogs(lastUpdate:number):number {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/logs", true);
    xhr.setRequestHeader("password", elements.adminpassword.value);
    xhr.setRequestHeader("minimumtime", lastUpdate.toString());
    xhr.onreadystatechange = () => {
        if(xhr.readyState != 4) return;

        let response = JSON.parse(xhr.responseText) as WebLogs;
        if(!response.success) return alert(`web error: ${response.message}`);

        let logs = response.logs;
        for(let i in logs) {
            let log = logs[i];
            let elem = document.createElement("p");
    
            let time = new Date(log.time);
            elem.innerHTML = `${time.toLocaleDateString()} ${time.toLocaleTimeString()} [${log.author}]: <span style="color:${log.color}">${log.content}</span>`;
    
            elements.adminlogbox.appendChild(elem);
        }
        elements.adminlogbox.scrollTop = elements.adminlogbox.scrollHeight;
    }

    xhr.send();

    return Date.now();
}

let lastUpdate = 0;

elements.adminsubmit.addEventListener("click", () => {
    elements.adminlogin.classList.add("hidden");
    elements.admincontent.classList.remove("hidden");

    setInterval(() => {
        lastUpdate = updateLogs(lastUpdate);
    }, 1000 * 10); // 10 seconds
    lastUpdate = updateLogs(0); // init

    getUploadedFiles();
});

elements.adminpassword.addEventListener("keydown", e => {
    if(e.key == "Enter" && !elements.adminlogin.classList.contains("hidden")) elements.adminsubmit.click();
});

elements.adminopen.addEventListener("click", () => {
    if(!elements.adminlogin.classList.contains("hidden") || !elements.admincontent.classList.contains("hidden")) return;
    elements.content.classList.add("hidden");
    elements.results.classList.add("hidden");
    elements.adminlogin.classList.remove("hidden");
});

elements.contentopen.addEventListener("click", () => {
    elements.adminlogin.classList.add("hidden");
    elements.content.classList.remove("hidden");
});