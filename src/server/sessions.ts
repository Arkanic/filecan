import gid from "generate-unique-id";

export default class Sessions {
    sessions:Array<string>;
    timeout:number;

    constructor(timeout:number = 1000 * 60 * 60 * 24 * 7) {
        this.sessions = [];
        this.timeout = timeout;
    }
    
    add():string {
        let session = gid({
            length: 128,
            useLetters: true,
            useNumbers: true
        });
        this.sessions.push(session);

        setTimeout(() => {
            this.delete(session);
        }, this.timeout);

        return session;
    }

    exists(token:string):boolean {
        return this.sessions.includes(token);
    }

    delete(token):boolean {
        if(!this.exists(token)) return false;

        delete this.sessions[token];
        return true;
    }
}