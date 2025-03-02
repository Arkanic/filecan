import {WebConfigSuccess} from "../../shared/types/webconfig";
import WebResponse, {WebSuccess} from "../../shared/types/webresponse";
import PermissionSet from "../../shared/types/permission";
import AuthRequest from "../../shared/types/request/authrequest";
import {WebAuthSuccess} from "../../shared/types/webauth";

export let config:WebConfigSuccess;

export const getConfig = new Promise<void>(async (resolve) => {
    let response = await makeAPICall<WebConfigSuccess>("/api/config", false);
    if(!response.success) throw new Error("Get config fail!");
    config = response;
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
export function makeAPICall<T extends WebSuccess>(path:string, authneeded:boolean, data?:FormData | {[unit:string]:any}, customXHR?:XMLHttpRequest):Promise<WebResponse<T>> {
    return new Promise((resolve, reject) => {
        let tokenData;
        if(authneeded) tokenData = getToken();
        if(!tokenData && authneeded) reject();
        let token;
        if(authneeded) token = tokenData!.token;

        let xhr = customXHR ? customXHR : new XMLHttpRequest();
        xhr.open("POST", path, true);
        if(authneeded) xhr.setRequestHeader("token", token);
        if(!(data instanceof FormData)) xhr.setRequestHeader("Content-Type", "application/json");

        xhr.addEventListener("readystatechange", (e) => {
            if(xhr.readyState != 4) return;

            let response = JSON.parse(xhr.responseText) as WebResponse<T>;
            resolve(response);
        });

        if(data && (data instanceof FormData)) xhr.send(data);
        else if(data) xhr.send(JSON.stringify(data));
        else xhr.send();
    });
}

export interface GetTokenResult {
    token:string,
    permissions:PermissionSet
}

/**
 * Get token and permissions from localstorage
 * 
 * @returns undefined if the token does not exist, or if the token is expired
 */
export function getToken():GetTokenResult | undefined {
    let token = localStorage.getItem("token");
    if(!token) return;

    if(localStorage.getItem("tokenForInstanceHash") != config.instanceHash) {
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
        localStorage.removeItem("tokenPermissions");
        localStorage.removeItem("tokenForInstanceHash");

        return;
    }
    
    let expiry = parseInt(localStorage.getItem("tokenExpiry")!);
    if(expiry < Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
        localStorage.removeItem("tokenPermissions");
        localStorage.removeItem("tokenForInstanceHash");

        return;
    }

    let permissions = parseInt(localStorage.getItem("tokenPermissions")!);

    return {
        token,
        permissions
    }
}

/**
 * Get a new token, or upgrade an existing token with more permissions
 * 
 * @param password if no password is required for upload, can be filled with any abritrary data
 * @param admin if true try admin password/login, if false try upload password/login
 */
export function authenticateUpgradeToken(password:string, admin:boolean):Promise<boolean> {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/auth/authenticate", true);

        let request:AuthRequest = {
            type: admin ? "admin" : "upload",
            password
        }
        let tokenResult = getToken();
        if(tokenResult) request.token = tokenResult.token;

        xhr.addEventListener("readystatechange", () => {
            if(xhr.readyState != 4) return;

            let response = JSON.parse(xhr.responseText) as WebResponse<WebAuthSuccess>;
            if(!response.success) {
                localStorage.removeItem("token");
                localStorage.removeItem("tokenExpiry");
                localStorage.removeItem("tokenPermissions");
                localStorage.removeItem("tokenForInstanceHash");
                return resolve(false);
            }

            localStorage.setItem("token", response.token);
            localStorage.setItem("tokenExpiry", response.expires.toString());
            localStorage.setItem("tokenPermissions", tokenResult ? (tokenResult.permissions | response.grantedPermissions).toString() : response.grantedPermissions.toString());
            localStorage.setItem("tokenForInstanceHash", config.instanceHash);
            resolve(true);
        });
        
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(request));
    });
}