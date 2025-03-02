import randomString from "./util/genrandom";
import SessionMetadata from "../shared/types/sessionmetadata";
import {PermissionSet} from "../shared/types/permission";

export class Session {
    token:string;
    created:Date;
    expiry:Date;
    lastInteraction:Date | undefined;
    permissions:PermissionSet;

    constructor(token:string, permissions:PermissionSet, expiry:Date) {
        this.token = token;
        this.created = new Date();
        this.expiry = expiry;
        this.permissions = permissions;
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
    private sessionLifespan:number;

    /**
     * @param lifespan Number of milliseconds the session should live for
     */
    constructor(lifespan:number) {
        this.sessions = {};
        this.sessionLifespan = lifespan;
    }

    /**
     * Adds an expiring session to the pool.
     * 
     * @returns Token for use with api
     */
    add(permissions:PermissionSet):string {
        let token = randomString(64);
        this.sessions[token].session = new Session(token, permissions, new Date(Date.now() + this.sessionLifespan));
        this.sessions[token].timeout = setTimeout(() => {
            this.revoke(token);
        }, this.sessionLifespan);

        return token;
    }
    
    revoke(token:string):boolean {
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

    exists(token:string):boolean {
        return this.sessions[token] ? true : false;
    }

    /**
     * Add permissions to a pre-existing session
     * @param permission a singular or set of permissions
     * @returns success?
     */
    addPermission(token:string, permission:PermissionSet):boolean {
        let session = this.get(token);
        if(!session) return false;

        session.permissions = session.permissions | permission;
        return true;
    }
}