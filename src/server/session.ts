import randomString from "./util/genrandom";
import SessionMetadata from "../shared/types/sessionmetadata";

export class Session {
    token:string;
    created:Date;
    expiry:Date;
    lastInteraction:Date | undefined;

    constructor(token:string, expiry:Date) {
        this.token = token;
        this.created = new Date();
        this.expiry = expiry;
    }

    /**
     * @returns number of milliseconds until the session expires
     */
    timeToExpiry():number {
        return this.expiry.getTime() - Date.now();
    }

    /**
     * This session has been looked up via the "api-specific" existence method, clearly it is being used
     */
    interactionObserved() {
        this.lastInteraction = new Date();
    }

    /**
     * @returns JSON-serialized public-safe metadata for session
     */
    serializeMetadata():SessionMetadata {
        return {
            created: this.created.getTime(),
            lastInteraction: this.lastInteraction.getTime()
        }
    }
}

export default class SessionManager {
    private sessions:{[unit:string]:{session:Session, timeout:NodeJS.Timeout}};

    constructor() {
        this.sessions = {};
    }

    /**
     * Adds an expiring session to the pool.
     * 
     * @param lifespan Number of milliseconds the session should live for
     * @returns Token for use with api
     */
    add(lifespan:number):string {
        let token = randomString(64);
        this.sessions[token].session = new Session(token, new Date(Date.now() + lifespan));
        this.sessions[token].timeout = setTimeout(() => {
            this.delete(token);
        }, lifespan);

        return token;
    }
    
    delete(token:string):boolean {
        if(!this.get(token)) return false;

        clearInterval(this.sessions[token].timeout);
        delete this.sessions[token];
        return true;
    }

    /**
     * Does not trigger interaction update recording, can also be used to check existence of token
     * @returns undefined if token does not exist
     */
    get(token:string):Session | undefined {
        if(!this.sessions[token]) return undefined;
        return this.sessions[token].session;
    }

    /**
     * Check if a provided token exists. This method is intended for use via the web middleware,
     * so using it will update the "last interacted" parameter inside the session.
     */
    isValid(token:string):boolean {
        if(!this.sessions[token]) return false;

        this.sessions[token].session.interactionObserved();
        return true;
    }
}