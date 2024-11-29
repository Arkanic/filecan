// somewhat incorrectly named, turn a date into a nice, pretty "3 days ago" or "in 8 months"
export default function timeAgo(when:Date | string | number):string {
    const date = when instanceof Date ? when : new Date(when);
    const formatter = new Intl.RelativeTimeFormat("en");

    const ranges = {
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