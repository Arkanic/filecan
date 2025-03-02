import WebResponse, {WebSuccess} from "./webresponse";

export interface WebConfigSuccess extends WebSuccess {
    requirePassword:boolean;
    customURLPath?:string;
    maxFilesizeMegabytes:number;
    instanceHash:string;
}

type WebConfig = WebResponse<WebConfigSuccess>;
export default WebConfig;