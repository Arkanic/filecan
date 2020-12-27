export let config;

export const getConfig = new Promise(resolve => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if(xhr.readyState != 4) return;
        if(xhr.status == 200) {
            config = JSON.parse(xhr.responseText);
            resolve();
        } else {

        }
    }
    xhr.open("GET", "/api/config", true);
    xhr.send();
});

export const sendData = (formData, action) => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if(xhr.readyState != 4) return;
        if(xhr.status == 200) {
            console.log(xhr.responseText);
        }
    }
    xhr.upload.onprogress = evt => {
        console.log(`%${evt.loaded/evt.total*100}`)
    }
    xhr.open("POST", action, true);
    xhr.setRequestHeader("password", document.getElementById("password").value);
    xhr.send(formData);
}