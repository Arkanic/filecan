# Filecan
Node.js temporary file hosting service - simple to use, simple to setup, and simple to configure.

## Features
- No-nonsense web interface for uploading files
- Default setup is 30 seconds of configuration away from being ready to host
- Files are served without any extra steps, can be configured to run host files in an alternate location or through a different service like nginx
- Admin panel for remotely checking on the status of filecan and managing files
- Password protection, uploading UI can be exposed to wider web
- Server provides one-command-to-update to the latest version


## Installation
Make sure you have the latest version of node and npm installed on the machine you want to use as your server (https://nodejs.org).

Create a folder where you would like to install filecan, and run the following command whilst inside it:

```sh
curl -o- https://raw.githubusercontent.com/Arkanic/filecan/refs/heads/main/tools/filecan.sh | bash
```

This will download filecan and the required files into your chosen folder. The script will make changes inside of the folder, and will not tamper with your system.

From there getting filecan to start is as simple as running `filecan.sh`! Visit `127.0.0.1:8080` to use filecan.

You will want to configure a few things before exposing filecan to the internet, have a look at `config.yml` for options. You will want to enable a upload password.

### Changing passwords
By default the upload password is disabled, and the admin password is "test". Obviously this is less than secure and you will want to change this before using filecan.

Passwords in filecan are stored in configuration as one-way hashes using bcrypt. Conveniently there is a small script provided to generate these hashes for you.

enter the "tools" folder, and open a terminal inside of it. Run the command `node genpassword.js <your password>`, replacing `<your password>` with the password you want to use. The script will spit out the password hash. You can now copy this into configuration, replacing the user or admin password as you see fit.

## Usage
Upload UI | Admin UI
--- | ---
 ![image](https://github.com/user-attachments/assets/03b845af-23a7-4d6d-b283-81cb65e93ec3) | ![image](https://github.com/user-attachments/assets/d045eb72-83fc-4cf6-b174-1f1a67b86c46)

Filecan works best reverse proxied through nginx or similar. Using alternate server software to host the uploaded files is extremely viable and easy to do, all you need to is host the "files" folder inside of your data directory. This can work well if you don't want to expose the UI to the internet, as you can access the upload UI through your private network while hosting the files in an alternate manner. Filecan will manage the uploading/deletion of the files in the background.

### Updating
Every so often the server software can be updated using ./update.sh, which will automatically download the latest release.

## Credits
[https://github.com/Arkanic](Arkanic)
