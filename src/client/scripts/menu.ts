import {config, makeAPICall} from "./networking";
import elements from "./elements";
import timeAgo from "./util/timeago";
import {WebLogsSuccess} from "../../shared/types/weblogs";
import {WebFileSuccess} from "../../shared/types/webfiles";
import {WebUploadSuccess} from "../../shared/types/webupload";


export function stopLoading() {
    elements.loading.classList.add("hidden");
    elements.content.classList.remove("hidden");
}

let logsLastUpdate = 0;
let adminOpen = false;
export function setupUI() {
    if (!config.requirePassword) {
        elements.passwordbox.classList.add("hidden");
    }

    elements.adminsubmit.addEventListener("click", async () => {
        try {
            logsLastUpdate = await updateLogs(0); // init
        } catch(err) { // user got password wrong
            elements.adminpassword.classList.add("angry");
            setTimeout(() => {
                elements.adminpassword.classList.remove("angry");
            }, 1000);
            return;
        }

        elements.adminlogin.classList.add("hidden");
        elements.admincontent.classList.remove("hidden");

        setInterval(async () => {
            logsLastUpdate = await updateLogs(logsLastUpdate);
        }, 1000 * 10);

        getUploadedFiles();
    });

    elements.adminpassword.addEventListener("keydown", e => {
        if(e.key == "Enter" && !elements.adminlogin.classList.contains("hidden")) elements.adminsubmit.click();
    });

    elements.admintoggle.addEventListener("click", () => {
        if(!adminOpen) {
            elements.title.innerText = "Admin";
            elements.content.classList.add("hidden");
            elements.results.classList.add("hidden");
            elements.adminlogin.classList.remove("hidden");

            elements.admintoggle.innerText = "Return";
        } else {
            window.location.reload();
        }

        adminOpen = !adminOpen;
    });

    elements.body.addEventListener("keypress", e => {
        if(e.key == "Enter" && !elements.content.classList.contains("hidden")) elements.submitbutton.click();
    });

    elements.submitbutton.addEventListener("click", async () => {
        let formData = new FormData(elements.form);

        let xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("loadstart", loadStart);
        xhr.upload.addEventListener("progress", progress);
        xhr.upload.addEventListener("load", load);

        let response:WebUploadSuccess;
        try {
            response = await makeAPICall<WebUploadSuccess>("/api/upload", elements.password.value, formData, xhr);
        } catch(err) {
            elements.adminpassword.classList.add("angry");
            setTimeout(() => {
                elements.adminpassword.classList.remove("angry");
            }, 1000);
            return;
        }

        elements.loading.classList.add("hidden");
        elements.results.classList.remove("hidden");

        let resultsdiv = document.createElement("div");
        resultsdiv.classList.add("border");

        for(let i in response.files) {
            let file = response.files[i];

            let itemdiv = document.createElement("div");
            itemdiv.classList.add("item-box");

            let filename = document.createElement("p");
            filename.appendChild(document.createTextNode(`${file.originalname}: `));

            let link = config.customURLPath ? config.customURLPath.replace("^s", file.filename) : `${window.location.protocol}//${window.location.host}/${file.filename}`;
            let linkElement = document.createElement("a");
            linkElement.target = "_blank";
            linkElement.href = link;
            linkElement.appendChild(document.createTextNode(link));

            filename.appendChild(linkElement);
            itemdiv.appendChild(filename);
            resultsdiv.appendChild(itemdiv);
        }

        elements.results.appendChild(resultsdiv);
    });

    let intervalID;
    let last = 0;
    let now = 0;
    let dif:number;

    function loadStart(e:Event):void {
        console.log("loadStart");
        elements.progressbox.classList.remove("hidden");
        intervalID = setInterval(() => {
            dif = now - last;
            last = now;
        }, 1000);
    }

    function progress(e):void {
        console.log("progress");
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

    function load(e):void {
        console.log("load");
        clearInterval(intervalID);
        elements.progressbox.classList.add("hidden");
        elements.content.classList.add("hidden");
        elements.loading.classList.remove("hidden");
    }
}

async function getUploadedFiles() {
    let response = await makeAPICall<WebFileSuccess>("/api/admin/files", elements.adminpassword.value);
    const {files} = response;
    for(let i in files) {
        let file = files[i];

        let filediv = document.createElement("div");
        filediv.classList.add("item-box");

        let details = document.createElement("p");
        details.appendChild(document.createTextNode(`${file.file.originalname}: ${file.views} views, created ${timeAgo(file.created)} / expires ${timeAgo(file.expires)}, ${(file.filesize / 1000 / 1000).toFixed(2)}mb`));

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

async function updateLogs(lastUpdate:number):Promise<number> {
    let response = await makeAPICall<WebLogsSuccess>("/api/admin/logs", elements.adminpassword.value, {minimumtime: lastUpdate});
    const {logs} = response;
    for(let i in logs) {
        let log = logs[i];
        let elem = document.createElement("p");
    
        let time = new Date(log.time);
        elem.innerHTML = `${time.toLocaleDateString()} ${time.toLocaleTimeString()} [${log.author}]: <span style="color:${log.color}">${log.content}</span>`;
    
        elements.adminlogbox.appendChild(elem);
    }
    elements.adminlogbox.scrollTop = elements.adminlogbox.scrollHeight;

    return Date.now();
}