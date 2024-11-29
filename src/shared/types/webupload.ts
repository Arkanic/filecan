import WebResponse, {WebSuccess} from "./webresponse";
import FileMetadata from "./filemetadata";

export interface WebUploadSuccess extends WebSuccess {
    files:Array<FileMetadata>;
}

type WebUpload = WebResponse<WebUploadSuccess>;
export default WebUpload;