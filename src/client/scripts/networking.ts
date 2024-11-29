import WebConfig from "../../shared/types/webconfig";

export let config:WebConfig;

export const getConfig = new Promise<void>(resolve => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if(xhr.readyState != 4) return;
        if(xhr.status == 200) {
            try {
                config = JSON.parse(xhr.responseText) as WebConfig;
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

export type XHREvent = ProgressEvent<XMLHttpRequestEventTarget>;
export type EventCallback = (e:XHREvent) => any;
export function sendData(formData:FormData, password:string, action:string, loadStart:EventCallback, progress:EventCallback, load:EventCallback, readyStateChange:(e:XHREvent, xhr:XMLHttpRequest) => any) {
    let xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("loadstart", loadStart);
    xhr.upload.addEventListener("progress", progress);
    xhr.upload.addEventListener("load", load);
    xhr.addEventListener("readystatechange", (e) => {
        readyStateChange(e as XHREvent, xhr);
    });

    xhr.open("POST", action, true);
    xhr.setRequestHeader("password", password);
    xhr.send(formData);
}