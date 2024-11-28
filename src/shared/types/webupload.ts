import {WebSuccess, WebError} from "./webresponse";
import FileMetadata from "./filemetadata";

interface WebUploadSuccess extends WebSuccess {
    files:Array<FileMetadata>;
}

type WebUpload = WebUploadSuccess | WebError;
export default WebUpload;