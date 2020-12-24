const config = require("../../config");

function auth(req, res, next) {
    console.log(req.headers.pword);
    next();
}

module.exports = auth;