import {WebConfigSuccess} from "../../shared/types/webconfig";
import WebResponse, {WebSuccess} from "../../shared/types/webresponse";

export let config:WebConfigSuccess;

export const getConfig = new Promise<void>(async (resolve) => {
    config = await makeAPICall<WebConfigSuccess>("/api/config");
    resolve();
});

/**
 * Make API call back to filecan
 * 
 * @param path API path
 * @param password password to be used, if blank will be treated as a no-password call
 * @param data optional post req json/formdata
 * @param customXHR if specified api call will use this xhr object for request. Intended use is so that code that needs to hook into events like progress and loadStart can use the same generic method.
 * @returns Typed information on success, void on failure with blocking alert() call beforehand
 */
export function makeAPICall<T extends WebSuccess>(path:string, password?:string, data?:FormData | {[unit:string]:any}, customXHR?:XMLHttpRequest):Promise<T> {
    return new Promise((resolve, reject) => {
        let xhr = customXHR ? customXHR : new XMLHttpRequest();
        xhr.open("POST", path, true);
        if(password) xhr.setRequestHeader("password", password);
        if(!(data instanceof FormData)) xhr.setRequestHeader("Content-Type", "application/json");

        xhr.addEventListener("readystatechange", (e) => {
            if(xhr.readyState != 4) return;

            let response = JSON.parse(xhr.responseText) as WebResponse<T>;
            if(!response.success || xhr.status != 200) {
                // TODO: better error message display
                throw new Error(`web error: ${response.message}`);
            }

            resolve(response);
        });

        if(data && (data instanceof FormData)) xhr.send(data);
        else if(data) xhr.send(JSON.stringify(data));
        else xhr.send();
    });
}