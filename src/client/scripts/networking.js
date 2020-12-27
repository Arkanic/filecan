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
    xhr.open("GET", `${window.location.protocol}//${window.location.hostname}/api/config`, true);
    xhr.send();
});