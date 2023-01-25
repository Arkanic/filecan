# Filecan
node.js file hoster
## Insallation
Make sure you have the latest version of node and npm installed on the machine you want to use as your server (https://nodejs.org).

Download or clone the repository onto the machine, then open your terminal inside of the filecan folder.

Run the command `npm i` to install the required packages.

Once that is done build code, using the command `npm run fullbuild`.

Then, to start the server, run the command `npm run start`.

Look into the config file for options to change how the server works.

If you want your server to be public to the internet, you need to port forward the port "8080", or the port that you have specified in the configuration file.

## Usage
The default password for the server is "test", however you can turn the password functionality off entirely (set `requirePassword` to `false` in config.js, using your preferred text editor.

### How to change the passowrd
find the "tools" folder inside the code (the folder is in the same directory as `index.js`), and open the terminal inside of it.

Run the command `node genpassword.js <your password>`, replacing `<your password>` with the password you want to use. This script will hash the password into a one-way function, so that it is unreadable. Replace the password variable in config.js with the random string the script spat out, using your favorite text editor.

You should now be able to run the server as normal, with the new password being the one that works.

## Credits
[https://github.com/Arkanic](Arkanic)
The best way to contact me would probably be through discord. My handle is Arkanic#3976.
