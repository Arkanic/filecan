// CONFIG FILE

// Generate the name for files when they are uploaded
const path = require("path");
const {customAlphabet} = require("nanoid");
const extname = require("path-complete-extname");
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

function genFilename(file) {
    return nanoid() + extname(file.originalname); // random set of 6 characters + the file extension of the original file
}

// Require password to upload files
const requirePassword = true;

// One way encrypted password
// use the command "node tools/genpassword.js <your password (no spaces)>" to generate the one-way hash.
// this one is "test".
const password = "$2b$10$cgz0yz/mv/HYZEVMiRaNqOUNi6Blay1qGX/O.0Cu8gCR1Apcz/pGS";

// Password for admin console
// generate same way as above
// this password is required as it provides access to the http admin panel (show logs etc)
// this one is "test"
const adminPassword = "$2b$10$cgz0yz/mv/HYZEVMiRaNqOUNi6Blay1qGX/O.0Cu8gCR1Apcz/pGS";

// Specify port, if undefined defaults to 8080.
const port = undefined || "8080";


module.exports = {genFilename, requirePassword, password, adminPassword, port};