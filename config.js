// CONFIG FILE

// Generate the name for files when they are uploaded
const path = require("path");
const {customAlphabet} = require("nanoid");
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

function genFilename(file) {
    return nanoid() + path.extname(file.originalname); // random set of 6 characters + the file extension of the original file
}

// Require password to upload files
const requirePassword = true;

// Password, if password is enabled (will be changed into bcrypt one-way very soon)
const password = "test";

// Specify port, if undefined defaults to 8080.
const port = undefined || 8080;


module.exports = {genFilename, requirePassword, password, port};