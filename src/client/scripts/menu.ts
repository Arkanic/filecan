import QrCreator from "qr-creator";
import {config, makeAPICall, authenticateUpgradeToken, tokenUsefulForAction} from "./networking";
import Permission from "../../shared/types/permission";
import elements from "./elements";
import timeAgo from "./util/timeago";
import {WebLogsSuccess} from "../../shared/types/weblogs";
import {WebFileSuccess} from "../../shared/types/webfiles";
import WebUpload, {WebUploadSuccess} from "../../shared/types/webupload";
import {WebSuccess} from "../../shared/types/webresponse";
import Icons from "../font/icons";
import IconButton from "./elements/iconbutton";
import Icon from "./elements/icon";


export function stopLoading() {
    elements.loading.classList.add("hidden");
    elements.content.classList.remove("hidden");
}

let logsLastUpdate = 0;
let adminOpen = false;
export function setupUI() {
    if (!config.requirePassword || tokenUsefulForAction(Permission.Upload)) {
        elements.passwordbox.classList.add("hidden");
    }

    elements.adminsubmit.addEventListener("click", async () => {
        let auth = false;
        if(tokenUsefulForAction(Permission.Admin)) auth = true;
        else auth = await authenticateUpgradeToken(elements.adminpassword.value, true);
        if(!auth) {
            elements.adminpassword.classList.add("angry");
            setTimeout(() => {
                elements.adminpassword.classList.remove("angry");
            }, 1000);
            return;
        }

        let firstUpdateLogsResponse = await updateLogs(0); // init

        logsLastUpdate = firstUpdateLogsResponse;

        elements.adminlogin.classList.add("hidden");
        elements.admincontent.classList.remove("hidden");

        setInterval(async () => {
            logsLastUpdate = await updateLogs(logsLastUpdate);
        }, 1000 * 10);

        elements.adminlogclear.addEventListener("click", async () => {
            await makeAPICall<WebUploadSuccess>("/api/admin/deletelogs", true, {timeoffset: 1000 * 60 * 60 * 24});
        });

        getUploadedFiles();
    });

    elements.adminpassword.addEventListener("keydown", e => {
        if(e.key == "Enter" && !elements.adminlogin.classList.contains("hidden")) elements.adminsubmit.click();
    });

    elements.admintoggle.addEventListener("click", () => {
        if(!adminOpen) {
            elements.admintoggle.innerText = "Return";

            // skip login box if we already think we have a token
            if(tokenUsefulForAction(Permission.Admin)) elements.adminsubmit.click();

            elements.title.innerText = "Admin";
            elements.content.classList.add("hidden");
            elements.results.classList.add("hidden");
            elements.adminlogin.classList.remove("hidden");
        } else {
            window.location.reload();
        }

        adminOpen = !adminOpen;
    });

    elements.body.addEventListener("keypress", e => {
        if(e.key == "Enter" && !elements.content.classList.contains("hidden")) elements.submitbutton.click();
    });

    elements.submitbutton.addEventListener("click", async () => {
        let auth = false;
        if(tokenUsefulForAction(Permission.Upload)) auth = true; // if we already have a token, let use it!
        else auth = await authenticateUpgradeToken(elements.password.value, false);
        if(!auth) {
            elements.loading.classList.add("hidden");
            elements.content.classList.remove("hidden");
            elements.password.classList.add("angry");
            setTimeout(() => {
                elements.password.classList.remove("angry");
            }, 1000);
            return;
        }

        let formData = new FormData(elements.form);

        let xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("loadstart", loadStart);
        xhr.upload.addEventListener("progress", progress);
        xhr.upload.addEventListener("load", load);

        let response = await makeAPICall<WebUploadSuccess>("/api/upload", true, formData, xhr);
        if(!response.success) return;

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

            const copySpan = new IconButton(Icons.content_copy, "Copy");
            const copySpanElem = copySpan.get();
            copySpanElem.addEventListener("click", () => {
                navigator.clipboard.writeText(link);
            });

            const qrSpan = new IconButton(Icons.qr_code_2, "Create QR code");
            const qrSpanElem = qrSpan.get(); 
            let qrCodeGenerated = false;
            qrSpanElem.addEventListener("click", () => {
                if(qrCodeGenerated) return;
                qrCodeGenerated = true;

                let canvas = document.createElement("canvas");
                canvas.classList.add("qrcode");
                canvas.width = 256;
                canvas.height = 256;
                QrCreator.render({
                    text: link,
                    radius: 0.0,
                    ecLevel: "H",
                    fill: "#000",
                    background: "#fff",
                    size: 256
                }, canvas);

                itemdiv.appendChild(document.createElement("br"));
                itemdiv.appendChild(canvas);
            });

            filename.appendChild(linkElement);
            filename.appendChild(copySpan.get());
            filename.appendChild(qrSpan.get());
            itemdiv.appendChild(filename);
            resultsdiv.appendChild(itemdiv);
        }

        elements.results.appendChild(resultsdiv);
    });

    let intervalID:any;
    let last = 0;
    let now = 0;
    let dif:number;

    function loadStart(e:any):void {
        console.log("loadStart");
        elements.progressbox.classList.remove("hidden");
        intervalID = setInterval(() => {
            dif = now - last;
            last = now;
        }, 1000);
    }

    function progress(e:any):void {
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

    function load(e:any):void {
        console.log("load");
        clearInterval(intervalID);
        elements.progressbox.classList.add("hidden");
        elements.content.classList.add("hidden");
        elements.loading.classList.remove("hidden");
    }
}

async function getUploadedFiles() {
    let response = await makeAPICall<WebFileSuccess>("/api/admin/files", true);
    if(!response.success) throw new Error("failed to get uploaded files");
    const {files} = response;
    for(let i in files) {
        let file = files[i];

        let filediv = document.createElement("div");
        filediv.classList.add("item-box");

        let details = document.createElement("p");

        let link = document.createElement("a");
        link.href = config.customURLPath ? config.customURLPath.replace("^s", file.file.filename) : `${window.location.protocol}//${window.location.host}/${file.file.filename}`;
        link.appendChild(document.createTextNode(`${file.file.originalname}`));
        details.appendChild(link);

        details.appendChild(document.createTextNode(`: ${file.views} views, created ${timeAgo(file.created)} / expires ${(file.expires == 0) ? "never" : timeAgo(file.expires)}, ${(file.filesize / 1000 / 1000).toFixed(2)}mb   `));

        let deleteButton = document.createElement("a");
        deleteButton.href = "#1";
        const deleteIcon = new Icon(Icons.delete).get();
        deleteIcon.classList.add("icon-inline");
        deleteButton.appendChild(deleteIcon);
        deleteButton.addEventListener("click", async () => {
            if(deleteButton.href.endsWith("#1")) { // first click
                deleteButton.href = "#";
                deleteButton.innerHTML = "";
                deleteButton.appendChild(document.createTextNode("Confirm"));
            } else { // second click
                await makeAPICall<WebSuccess>("/api/admin/delete", true, {filename: file.file.filename});
                filediv.remove();
            }
        });

        details.appendChild(deleteButton);

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
    let response = await makeAPICall<WebLogsSuccess>("/api/admin/logs", true, {minimumtime: lastUpdate});
    if(!response.success) return -1;
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