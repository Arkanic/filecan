import "../css/global.css"

let login = document.getElementById("login");
let password = document.getElementById("password");
let submit = document.getElementById("submit");
let error = document.getElementById("error");

let content = document.getElementById("content");
let logbox = document.getElementById("logbox");

submit.addEventListener("click", () => {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/logs", true);
    xhr.setRequestHeader("password", password.value);
    xhr.onreadystatechange = () => {
        if(xhr.readyState != 4) return;
        
        let response = JSON.parse(xhr.responseText);
        if(xhr.status != 200) {
            if(xhr.status == 400 || xhr.status == 401) {
                return error.innerHTML = response.message;
            } else {
                return error.innerHTML = "Unknown network error!";
            }
        }

        login.classList.add("hidden");
        content.classList.remove("hidden");

        let logs = response.logs;
        for(let i in logs) {
            let log = logs[i];
            let elem = document.createElement("p");

            let time = new Date(log.time);
            elem.innerHTML = `${time.toLocaleDateString()} ${time.toLocaleTimeString()} [${log.author}]: <span style="color:${log.color}">${log.content}</span>`;

            logbox.appendChild(elem);
        }
    }
    
    xhr.send();
});