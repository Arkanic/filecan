const bcrypt = require("bcrypt");
const saltRounds = 10;

function genHash(pword, saltRounds, then) {
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if(err) throw err;
        bcrypt.hash(pword, salt, (err, hash) => {
            if(err) throw err;
            then(hash);
        });
    });
}

let args = process.argv.slice(2);
genHash(args[0], saltRounds, console.log);

module.exports = genHash;