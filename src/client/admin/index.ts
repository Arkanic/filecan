import "../css/global.css"
import WebLogs from "../../shared/types/weblogs";
import WebFiles from "../../shared/types/webfiles";

let login = document.getElementById("login")!;
let password = document.getElementById("password")! as HTMLInputElement;
let submit = document.getElementById("submit")!;

let filesbox = document.getElementById("filesbox")!;

let content = document.getElementById("content")!;
let logbox = document.getElementById("logbox")!;

function getUploadedFiles() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/files", true);
    xhr.setRequestHeader("password", password.value);
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
            filesbox.appendChild(filediv);
        }

        if(files.length == 0) {
            let p = document.createElement("p");
            let i = document.createElement("i");
            i.appendChild(document.createTextNode("No files uploaded..."));
            p.appendChild(i);

            filesbox.appendChild(p);
        }
    }

    xhr.send();
}

function updateLogs(lastUpdate:number):number {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/logs", true);
    xhr.setRequestHeader("password", password.value);
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
    
            logbox.appendChild(elem);
        }
        logbox.scrollTop = logbox.scrollHeight;
    }

    xhr.send();

    return Date.now();
}

let lastUpdate = 0;

submit.addEventListener("click", () => {
    login.classList.add("hidden");
    content.classList.remove("hidden");

    setInterval(() => {
        lastUpdate = updateLogs(lastUpdate);
    }, 1000 * 10); // 10 seconds
    lastUpdate = updateLogs(0); // init

    getUploadedFiles();
});

password.addEventListener("keydown", e => {
    if(e.code == "Enter") submit.click();
});