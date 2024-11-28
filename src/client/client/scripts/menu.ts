import {config, sendData, XHREvent} from "./networking";

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
        if(e.key == "Enter") elements.submitbutton.click();
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
        let json = JSON.parse(xhr.responseText);
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
