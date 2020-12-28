// CONFIG FILE

// Generate the name for files when they are uploaded
const path = require("path");
const {customAlphabet} = require("nanoid");
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

function genFilename(file) {
    return nanoid() + path.extname(file.originalname); // random set of 6 characters + the file extension of the original file
}

// Require password to upload files
const requirePassword = false;

// One way encrypted password
// use the command "node tools/genpassword.js <your password (no spaces)>" to generate the one-way hash.
const password = "$2b$10$RuA0yFbUqtOl2i3iXC3D/uEPDVL5BHZzBAA03vW9bNh4s7yo7g1he";

// Specify port, if undefined defaults to 8080.
const port = undefined || 8080;


module.exports = {genFilename, requirePassword, password, port};