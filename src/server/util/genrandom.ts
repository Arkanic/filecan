import {getRandomValues} from "crypto";

/**
 * 32-bit depth crypto random replacement for Math.random
 */
export function random():number {
    return getRandomValues(new Uint32Array(1))[0] / 2**32;
}

/**
 * @param characters optional, string of characters to use. If not set will default to lowercase alphanumeric.
 * @returns True crypto random string
 */
export default function randomString(length:number):string;
export default function randomString(length:number, characters?:string):string {
    const map = characters ? characters : "abcdefghijklmnopqrstuvwxyz0123456789";
    let str = "";
    for(let i = 0; i < length; i++) {
        str += map[Math.floor(random() * map.length)];
    }

    return str;
}