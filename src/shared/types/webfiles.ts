import WebResponse, {WebSuccess} from "./webresponse";
import FileMetadata from "./filemetadata";

export interface WebFile {
    created:number;
    expires:number;
    file:FileMetadata;
    filesize:number;
    views:number;
};

export interface WebFileSuccess extends WebSuccess {
    files:Array<WebFile>;
};

type WebFiles = WebResponse<WebFileSuccess>;
export default WebFiles;