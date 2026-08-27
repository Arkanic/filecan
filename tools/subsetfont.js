// generate a subset font out of a larger one, for optimising icon font packs down to only the used icons
// USAGE: node tools/subsetfont.js <input font/codepoint path without extension> <file with list of codepoints wanted> <output font path>

const fs = require("fs");
const path = require("path");
const {exec} = require("child_process");

let args = process.argv.slice(2);

const codepoints = path.resolve(args[0] + ".codepoints");
const font = path.resolve(args[0] + ".woff2");
const out = path.resolve(args[2]);
const wantedCodepoints = fs.readFileSync(path.resolve(args[1])).toString().split("\n").map(x => x.split(" ")[0]);
const allCodepoints = Object.fromEntries(fs.readFileSync(codepoints).toString().split("\n").map(x => x.split(" ")));

let outputCharacters = "";
for(let codepoint of wantedCodepoints) {
    outputCharacters += `,U+${allCodepoints[codepoint]}`;
}
outputCharacters = outputCharacters.slice(1);

// yes i know. but this is a dev tool, the only person you are pwning is yourself
exec(`pyftsubset ${font} --unicodes="${outputCharacters}" --output-file=${out}`, (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);

    console.log(`output size: ${fs.statSync(out).size / 1000}kb`);
});