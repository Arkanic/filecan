// CONFIG FILE

// Generate the name for files when they are uploaded
const path = require("path");
const extname = require("path-complete-extname");
// Require password to upload files
const requirePassword = true;

// One way encrypted password
// use the command "node tools/genpassword.js <your password (no spaces)>" to generate the one-way hash.
// this one is "test".
// alternatively use PASSWORD env variable
const password = "$2b$10$cgz0yz/mv/HYZEVMiRaNqOUNi6Blay1qGX/O.0Cu8gCR1Apcz/pGS";

// Password for admin console
// generate same way as above
// this password is required as it provides access to the http admin panel (show logs etc)
// this one is "test"
// alternatively use ADMIN_PASSWORD env variable
const adminPassword = "$2b$10$cgz0yz/mv/HYZEVMiRaNqOUNi6Blay1qGX/O.0Cu8gCR1Apcz/pGS";

// Specify port, if undefined defaults to 8080.
const port = undefined || "8080";

// set to TRUE if reverse proxy is being used (to check for x-forwarded-for header)
const reverseProxy = false;

// maximum file size that can be uploaded
const maxFileSize = 100 * 1000 * 1000; // 100mb


module.exports = {maxFileSize, reverseProxy, requirePassword, password, adminPassword, port};