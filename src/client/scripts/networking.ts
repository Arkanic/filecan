import WebConfig from "../../shared/types/webconfig";
import WebResponse, {WebSuccess} from "../../shared/types/webresponse";

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

export function makeAPICall<T extends WebSuccess>(path:string, password?:string, data?:{[unit:string]:any}):Promise<T> {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", path, true);
        if(password) xhr.setRequestHeader("password", password);
        if(data) xhr.setRequestHeader("Content-Type", "application/json");

        xhr.addEventListener("readystatechange", (e) => {
            if(xhr.readyState != 4) return;

            let response = JSON.parse(xhr.responseText) as WebResponse<T>;
            if(!response.success) {
                // TODO: better error message display
                alert(`web error: ${response.message}`);
                return reject();
            }

            resolve(response);
        });

        if(data) xhr.send(JSON.stringify(data));
        else xhr.send();
    });
}