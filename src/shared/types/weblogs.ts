import {WebSuccess, WebError} from "./webresponse";

export interface WebLog {
    time:number;
    author:string;
    color:string;
    content:string;
}

export interface WebLogsSuccess extends WebSuccess {
    logs:Array<WebLog>;
}

type WebLogs = WebLogsSuccess | WebError;
export default WebLogs;