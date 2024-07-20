export let config;

export const getConfig = new Promise(resolve => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if(xhr.readyState != 4) return;
        if(xhr.status == 200) {
            try {
                config = JSON.parse(xhr.responseText);
            } catch(e) {
                console.log(xhr.responseText);
                throw e;
            }
            resolve();
        } else {

        }
    }
    xhr.open("GET", "/api/config", true);
    xhr.send();
});

export const sendData = (formData, action, loadStart, progress, load, readyStateChange) => {
    let xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("loadstart", loadStart);
    xhr.upload.addEventListener("progress", progress);
    xhr.upload.addEventListener("load", load);
    xhr.addEventListener("readystatechange", (evt) => {
        readyStateChange(evt, xhr);
    });

    xhr.open("POST", action, true);
    xhr.setRequestHeader("password", document.getElementById("password").value);
    xhr.send(formData);
}