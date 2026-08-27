import WebResponse, {WebSuccess} from "./webresponse";
import {PermissionSet} from "./permission";

export interface WebAuthSuccess extends WebSuccess {
    token:string,
    grantedPermissions:PermissionSet;
    expires:number;
}

type WebAuth = WebResponse<WebAuthSuccess>;
export default WebAuth;