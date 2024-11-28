// nuance is a fine art

interface PureWebResponse {
    success:boolean;
    message:string;
}

export interface WebSuccess extends PureWebResponse {
    success:true;
}

export interface WebError extends PureWebResponse {
    success:false;
}

export type WebResponse = WebSuccess | WebError;