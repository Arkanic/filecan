// somewhat incorrectly named, turn a date into a nice, pretty "3 days ago" or "in 8 months"
export default function timeAgo(when:Date | string | number):string {
    const date = when instanceof Date ? when : new Date(when);
    const formatter = new Intl.RelativeTimeFormat("en");

    const ranges:{[unit:string]:number} = {
        years: 60 * 60 * 24 * 365,
        months: 60 * 60 * 24 * 30,
        weeks: 60 * 60 * 24 * 7,
        days: 60 * 60 * 24,
        hours: 60 * 60,
        minutes: 60,
        seconds: 1
    }

    const secondsElapsed = (date.getTime() - Date.now()) / 1000;
    for(let i in ranges) {
        let range = ranges[i];
        if(range < Math.abs(secondsElapsed)) {
            const delta = secondsElapsed / range;
            // @ts-ignore
            return formatter.format(Math.round(delta), i);
        }
    }

    return "broke";
}

/**
 * Unit-ify an absolute value using the smallest unit into a more sensible range
 * @param unit the value
 * @param ranges array of string:number indexes, i.e. for data {MB: 1000 * 1000, KB: 1000, B: 1}
 * @returns the resulting formatted down amount, i.e. "1.20 MB"
 */
export function scaleUnit(unit:number, ranges:{[unit:string]:number}):string {
    const sorted = Object.fromEntries(Object.entries(ranges).sort((a, b) => b[1] - a[1]));

    for(let i in sorted) {
        const range = sorted[i];
        if(range < Math.abs(unit)) {
            const delta = unit / range;
            return `${delta.toFixed(2)} ${i}`;
        }
    }

    return "";
}

export const DataUnitRanges:{[unit:string]:number} = {
    TB: 1000 * 1000 * 1000 * 1000,
    GB: 1000 * 1000 * 1000,
    MB: 1000 * 1000,
    KB: 1000,
    B: 1
}