Mutual TLS a.k.a mTLS is a method for mutual authentication between server and client. Unlike the TLS encryption protocol, in mTLS both server and client have a certificate and the server verifies the certificate of the client.

First of all the client connects to the server then the server presents its own TLS certificate. The client presents its own certificate. The server grants access to the client depending on whether the client of the certificate is verified or not.

source:https://www.cloudflare.com/learning/access-management/what-is-mutual-tls/

<!-- ![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/du9k2ygt8btga8yg7nz8.png) -->

![mtls diagram](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/du9k2ygt8btga8yg7nz8.png)

# What does the nginx server in this situation?

The nginx server presents the TLS certificate and verifies the certificate of the client. if there is a certificate of the client and the server can verify it the nginx server grants the client access and passes the client request to node js express server using reverse proxy. If not, the nginx server rejects the client and sends an error message.
