import WebResponse, {WebSuccess} from "./webresponse";

export interface WebConfigSuccess extends WebSuccess {
    requirePassword:boolean;
    customURLPath?:string;
    maxFilesizeMegabytes:number;
}

type WebConfig = WebResponse<WebConfigSuccess>;
export default WebConfig;