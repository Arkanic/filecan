const bcrypt = require("bcrypt");
const config = require("../../config");

function auth(req, res, next) {
    if(!config.requirePassword) next();
    let password = req.headers.password;
    if(!password) {
        res.status(400).json({
            success: false,
            message: "Password is missing"
        });
        console.log("Attempted upload, password missing");
    } else {
        bcrypt.compare(password, config.password, (err, matches) => {
            if(err) throw err;
            if(matches) next();
            else {
                res.status(401).json({
                    success: false,
                    message: "Incorrect password"
                });
                console.log("Attempted upload, incorrect password");
            }
        });
    }
}

module.exports = auth;