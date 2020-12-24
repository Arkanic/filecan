function auth(req, res, next) {
    console.log(req.headers);
    next();
}

module.exports = auth;