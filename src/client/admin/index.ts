import "../css/global.css"
import WebLogs from "../../shared/types/weblogs";

let login = document.getElementById("login")!;
let password = document.getElementById("password")! as HTMLInputElement;
let submit = document.getElementById("submit")!;
let error = document.getElementById("error")!;

let content = document.getElementById("content")!;
let logbox = document.getElementById("logbox")!;

function updateLogs(lastUpdate:number) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/logs", true);
    xhr.setRequestHeader("password", password.value);
    xhr.setRequestHeader("minimumtime", lastUpdate.toString());
    xhr.onreadystatechange = () => {
        if(xhr.readyState != 4) return;

        let response = JSON.parse(xhr.responseText) as WebLogs;
        if(!response.success) return error.innerHTML = response.message;

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
});