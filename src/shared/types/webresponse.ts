// nuance is a fine art

interface PureWebResponse {
    success:boolean;
    message?:string;
}

export interface WebSuccess extends PureWebResponse {
    success:true;
}

export interface WebError extends PureWebResponse {
    success:false;
    message:string;
}

type WebResponse<T extends WebSuccess> = T | WebError;
export default WebResponse;