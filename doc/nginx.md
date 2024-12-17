# Using Filecan with Nginx

Putting filecan behind a reverse proxy such as Nginx is pretty simple to set up, and the recommended way of exposing it to the internet.

## Setup

### Config.yml
First off filecans' configuration needs to be setup correctly:

- MAKE SURE YOU HAVE A USER PASSWORD AND A NON-DEFAULT ADMIN PASSWORD. See [setting up passwords](../README.md#changing-passwords)
- Set `port` to a non-standard number of your choice so that it is not hogging port 8080 which is commonly used - keep the port in mind for later, for now we will use "2501"
- Set `reverseProxy: true`. This helps filecan with understanding how to identify an incoming connection by IP.

### Nginx configuration
Nginx configuration is via a simple proxy-pass, providing the `X-Forwarded-For` header for filecan to take note of.

Here is what the entry looks like over HTTPS:

```
server {
    listen 443 ssl;

    # replace this with the URL you wish to listen on
    server_name filecan.example.com;

    ssl_certificate /path/to/your/ssl_cert.pem;
    ssl_certificate_key /path/to/your/ssl_privkey.pem;

    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # set this to 1M greater than your max filesize upload in config.yml (default is 100MB)
        client_max_body_size 101M;

        # set the address to the internal address that filecan is being hosted on
        proxy_pass http://127.0.0.1:2501;
    }
}
```

That's it! if you restart nginx and filecan, everything should work as anticipated!

## Hosting uploaded files seperately

If you do not wish to have filecan exposed to the wider internet at all, you can have filecan not port forwarded and only host the uploaded files through a third-party webserver of your choice.

For your webserver all that is required is to host the `data/files` folder, MAKING SURE NOT TO HOST `data` ITSELF. so long as the filecan program is running it will automatically manage the files.

### Config.yml
To set up Filecan for this scenario, make sure to update the relevant fields in `config.yml`:
- `hostStaticFiles: false` is optional, if you still want to be able to access the files internally via your local IP this is possible.
- `customURLPath` should be set to the internet URL that you plan on hosting the files. This is so that filecan can create links that are "correct" when you upload a file.