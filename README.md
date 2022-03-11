Mutual TLS a.k.a mTLS is a method for mutual authentication between server and client. In this tutorial, I make a basic mTSL example using nginx and node.

# Github Code

You can read the project belonging to this tutorial by getting the link below.

- https://github.com/pandashavenobugs/mTLS-with-node-blogpost

First of all the client connects to the server then the server presents its own TLS certificate. Unlike the TLS encryption protocol, in mTLS both server and client have a certificate and the server verifies the certificate of the client. The client presents its own certificate. The server grants access to the client depending on whether the client of the certificate is verified or not.

<!-- ![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/du9k2ygt8btga8yg7nz8.png) -->

![mtls diagram](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/du9k2ygt8btga8yg7nz8.png)

# What does the nginx server in this situation?

The nginx server presents the TLS certificate and verifies the certificate of the client. if there is a certificate of the client and the nginx server can verify it the nginx server grants the client access and passes the client request to node js express server using reverse proxy. If not, the nginx server rejects the client and sends an error message.

# Creating certificates

Creating a cert folder and navigating to it

```bash
mkdir certs
cd certs
```

Creating server certificate and key

### note After creating the certificate and key, we could see some questions about certificates such as country, locality name and email address, etc. You can pass all of the questions by pressing enter. In this tutorial, I'm passing all of these questions because I use the IP address instead of hostname. In addition, you can change the rsa and days. It depends on what you want.

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

In this example, using "ssl_client_certificate", the nginx server verifies the certificate which is claimed by the client. The client makes a request to the "https://{serverIP}/api/" host with the client certificate and client key. If the nginx server verifies the certificate, passes this request to "http://127.0.0.1:3000".

### Note: Usually ssl certificates are used in /etc/ssl directory but in this tutorial, I get the certificates in the certs folder in the /etc/nginx directory.

# Creating node express server and client

```bash
mkdir mtls_node
cp -r certs mtls_node
cd mtls_node
yarn init -y
yarn add express cors axios
yarn add @types/node @types/express @types/cors typescript ts-node -D
mkdir src
touch src/app.ts
touch src/client.ts
```

I created the mtls_node folder but you can name it whatever you want. I copy-pasted the certs folder to the mtls_node.

### src/app.ts

```typescript
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
const port = 3000;
const host = "127.0.0.1";
const app = express();

app.use(cors());

app.get("/api/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    message: "certificate verified succesfully",
  });
});

app.listen(port, host, () => {
  console.log("im listening");
});
```

When the nginx server passes the get request to the express server that is running on "127.0.0.1:3000" the express server sends the client a message with a 200 status code.

### src/client.ts

```typescript
import axios, { AxiosError } from "axios";
import https from "https";
import fs from "fs";

const getRequestWithCertificate = async () => {
  try {
    const cert = fs.readFileSync("certs/client.crt");
    const key = fs.readFileSync("certs/client.key");
    const hostName = "192.168.0.20";
    const httpsAgent = new https.Agent({
      cert,
      key,
      rejectUnauthorized: false,
    });

    const response = await axios.get(`https://${hostName}/api/test`, {
      httpsAgent,
    });
    console.log(response.data);
  } catch (e: any) {
    const error = e as Error | AxiosError;
    if (!axios.isAxiosError(error)) {
      console.log("native error");
      // when it throws native error
      console.log(error);
    } else {
      // when it throws axios error
      if (error.request) {
        console.log("request error");
        console.log(error.request);
        //when requested but there is no response from server
      }
      if (error.response) {
        console.log("response error");
        // the request was made and server responsed tiwh a status code
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      }
    }
  }
};

setTimeout(() => {
  getRequestWithCertificate();
}, 1000);
```

While creating the client,the important thing is the "rejectUnauthorized: false" side. If the rejectUnauthorized is true, the axios throws the 'DEPTH_ZERO_SELF_SIGNED_CERT' error.

# Compiling and running

Compiling the project

```bash
tsc
```

Running the app

```bash
node build/app.js
```

Running the client

```bash
node build/client.js
```

When we run the build/client.js we should see the console log like this.

```js
{
  message: "certificate verified succesfully";
}
```

Thanks for reading.

Sources:

- https://www.cloudflare.com/learning/access-management/what-is-mutual-tls/
- https://www.youtube.com/watch?v=UzEzjon3IAo&t=171s
- https://medium.com/geekculture/mtls-with-nginx-and-nodejs-e3d0980ed950

Contact me

- [Linkedin](https://www.linkedin.com/in/cengiz-berat-din%C3%A7kan-ab4208128/)

- [twitter](https://twitter.com/dinckan_berat)

- [github](https://github.com/pandashavenobugs)
