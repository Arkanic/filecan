import WebResponse, {WebSuccess} from "./webresponse";

export interface WebLog {
    time:number;
    author:string;
    color:string;
    content:string;
}

export interface WebLogsSuccess extends WebSuccess {
    logs:Array<WebLog>;
}

type WebLogs = WebResponse<WebLogsSuccess>;
export default WebLogs;