Mutual TLS a.k.a mTLS is a method for mutual authentication between server and client. Unlike the TLS encryption protocol, in mTLS both server and client have a certificate and the server verifies the certificate of the client.

First of all the client connects to the server then the server presents its own TLS certificate. The client presents its own certificate. The server grants access to the client depending on whether the client of the certificate is verified or not.

source:https://www.cloudflare.com/learning/access-management/what-is-mutual-tls/

<!-- ![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/du9k2ygt8btga8yg7nz8.png) -->

![mtls diagram](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/du9k2ygt8btga8yg7nz8.png)

# What does the nginx server in this situation?

The nginx server presents the TLS certificate and verifies the certificate of the client. if there is a certificate of the client and the server can verify it the nginx server grants the client access and passes the client request to node js express server using reverse proxy. If not, the nginx server rejects the client and sends an error message.

# Creating certificates

Creating a cert folder and navigating to it

```bash
mkdir certs
cd certs
```

Creating server certificate and key

## note

After creating the certificate and key, we could see some questions about certificates such as country, locality name and email address, etc. You can pass all of the questions by pressing enter. In this tutorial, I'm passing all of these questions because I use the IP address instead of hostname. In addition, you can change the rsa and days. It depends on what you want.

```bash
openssl req -x509 -nodes -days 9999 -newkey rsa:2048 -keyout server.key -out server.crt
```

Creating client certificate and key

```bash
openssl req -x509 -nodes -days 9999 -newkey rsa:2048 -keyout client.key -out client.crt
```

navigating back and copy-pasting the certs folder to /etc/nginx/ directory

```bash
cd ..
sudo cp -r certs /etc/nginx/
```

# nginx configuration

heading to the /etc/nginx directory

```bash
cd /etc/nginx/sites-available
```

creating and editingthe nginx server configuration which is named myapp.

The myapp file

```.conf
server{
    listen 443 ssl;
    ssl_certificate /etc/nginx/certs/server.crt;
    ssl_certificate_key /etc/nginx/certs/server.key;
    ssl_client_certificate /etc/nginx/certs/client.crt;
    ssl_verify_client on;
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

}
```
