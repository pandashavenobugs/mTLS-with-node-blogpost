Mutual TLS a.k.a mTLS is a method for mutual authentication between server and client . It is also used to secure microservices. In this tutorial, I make a basic mTSL example using nginx and node.

# Github Code

You can read the project belonging to this tutorial by getting the link below.

- https://github.com/pandashavenobugs/mTLS-with-node-blogpost

First of all the client connects to the server then the server presents its own TLS certificate. Unlike the TLS encryption protocol, in mTLS both server and client have a certificate and the server verifies the certificate of the client. The client presents its own certificate. The server grants access to the client depending on whether the client of the certificate is verified or not.

<!-- ![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/du9k2ygt8btga8yg7nz8.png) -->

![mtls diagram](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/du9k2ygt8btga8yg7nz8.png)

# What does the nginx server in this situation?

The nginx server presents the TLS certificate and verifies the certificate of the client. if there is a certificate of the client and the nginx server can verify it the nginx server grants the client access and passes the client request to node js express server using reverse proxy. If not, the nginx server rejects the client and sends an error message.

# Creating certificates

Creating the certs folder and navigating to it.

```bash
mkdir certs
cd certs
```

Creating server certificate and key.

### note After creating the certificate and key, we could see some questions about certificates such as country, locality name and email address, etc. You can pass all of the questions by pressing enter. In this tutorial, I'm passing all of these questions because I use the IP address instead of the hostname. In addition, you can change the rsa and days. It depends on what you want.

```bash
openssl req -x509 -nodes -days 9999 -newkey rsa:2048 -keyout server.key -out server.crt
```

Creating client certificate and key.

```bash
openssl req -x509 -nodes -days 9999 -newkey rsa:2048 -keyout client.key -out client.crt
```

Navigating back and copy-pasting the certs folder to /etc/nginx/ directory.

```bash
cd ..
sudo cp -r certs /etc/nginx/
```

# nginx configuration

Heading to the /etc/nginx directory.

```bash
cd /etc/nginx/sites-available
```

Creating and editingthe nginx server configuration which is named myapp.

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

Including the myapp file to /etc/nginx/nginx.conf.

```confg
http{
    .
    .
    .
    include /etc/nginx/conf.d/*.conf;
	#include /etc/nginx/sites-enabled/*;
    include /etc/nginx/sites-available/myapp;
}

```

I comment out the sites-enabled side because the myapp can be affected in a negative way.

In this example, using "ssl_client_certificate", the nginx server verifies the certificate which is claimed by the client. The client makes a request to the "https://{serverIP}/api/" host with the client certificate and client key. If the nginx server verifies the certificate, passes this request to "http://127.0.0.1:3000".

### Note: Usually ssl certificates are used in the /etc/ssl directory but in this tutorial, I get the certificates from the certs folder in the /etc/nginx directory.

# Creating node express server and client.

```bash
mkdir mtls_node
cp -r certs mtls_node
cd mtls_node
yarn init -y
yarn add express cors axios
yarn add @types/node @types/express @types/cors typescript ts-node -D
tsc -init
mkdir src
touch src/app.ts
touch src/client.ts
```

I created the mtls_node folder but you can name it whatever you want. I copy-pasted the certs folder to the mtls_node.

tsconfig.json file

```js
{
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig.json to read more about this file */

    /* Projects */
    // "incremental": true,                              /* Enable incremental compilation */
    // "composite": true,                                /* Enable constraints that allow a TypeScript project to be used with project references. */
    // "tsBuildInfoFile": "./",                          /* Specify the folder for .tsbuildinfo incremental compilation files. */
    // "disableSourceOfProjectReferenceRedirect": true,  /* Disable preferring source files instead of declaration files when referencing composite projects */
    // "disableSolutionSearching": true,                 /* Opt a project out of multi-project reference checking when editing. */
    // "disableReferencedProjectLoad": true,             /* Reduce the number of projects loaded automatically by TypeScript. */

    /* Language and Environment */
    "target": "es2016",                                  /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    // "lib": [],                                        /* Specify a set of bundled library declaration files that describe the target runtime environment. */
    // "jsx": "preserve",                                /* Specify what JSX code is generated. */
    // "experimentalDecorators": true,                   /* Enable experimental support for TC39 stage 2 draft decorators. */
    // "emitDecoratorMetadata": true,                    /* Emit design-type metadata for decorated declarations in source files. */
    // "jsxFactory": "",                                 /* Specify the JSX factory function used when targeting React JSX emit, e.g. 'React.createElement' or 'h' */
    // "jsxFragmentFactory": "",                         /* Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. 'React.Fragment' or 'Fragment'. */
    // "jsxImportSource": "",                            /* Specify module specifier used to import the JSX factory functions when using `jsx: react-jsx*`.` */
    // "reactNamespace": "",                             /* Specify the object invoked for `createElement`. This only applies when targeting `react` JSX emit. */
    // "noLib": true,                                    /* Disable including any library files, including the default lib.d.ts. */
    // "useDefineForClassFields": true,                  /* Emit ECMAScript-standard-compliant class fields. */

    /* Modules */
    "module": "commonjs",                                /* Specify what module code is generated. */
    "rootDir": "./src",                                  /* Specify the root folder within your source files. */
    "moduleResolution": "node",                       /* Specify how TypeScript looks up a file from a given module specifier. */
    "baseUrl": ".",                                  /* Specify the base directory to resolve non-relative module names. */
    // "paths": {},                                      /* Specify a set of entries that re-map imports to additional lookup locations. */
    // "rootDirs": [],                                   /* Allow multiple folders to be treated as one when resolving modules. */
    // "typeRoots": [],                                  /* Specify multiple folders that act like `./node_modules/@types`. */
    // "types": [],                                      /* Specify type package names to be included without being referenced in a source file. */
    // "allowUmdGlobalAccess": true,                     /* Allow accessing UMD globals from modules. */
    // "resolveJsonModule": true,                        /* Enable importing .json files */
    // "noResolve": true,                                /* Disallow `import`s, `require`s or `<reference>`s from expanding the number of files TypeScript should add to a project. */

    /* JavaScript Support */
    // "allowJs": true,                                  /* Allow JavaScript files to be a part of your program. Use the `checkJS` option to get errors from these files. */
    // "checkJs": true,                                  /* Enable error reporting in type-checked JavaScript files. */
    // "maxNodeModuleJsDepth": 1,                        /* Specify the maximum folder depth used for checking JavaScript files from `node_modules`. Only applicable with `allowJs`. */

    /* Emit */
    // "declaration": true,                              /* Generate .d.ts files from TypeScript and JavaScript files in your project. */
    // "declarationMap": true,                           /* Create sourcemaps for d.ts files. */
    // "emitDeclarationOnly": true,                      /* Only output d.ts files and not JavaScript files. */
    // "sourceMap": true,                                /* Create source map files for emitted JavaScript files. */
    // "outFile": "./",                                  /* Specify a file that bundles all outputs into one JavaScript file. If `declaration` is true, also designates a file that bundles all .d.ts output. */
    "outDir": "./build",                                   /* Specify an output folder for all emitted files. */
    // "removeComments": true,                           /* Disable emitting comments. */
    // "noEmit": true,                                   /* Disable emitting files from a compilation. */
    // "importHelpers": true,                            /* Allow importing helper functions from tslib once per project, instead of including them per-file. */
    // "importsNotUsedAsValues": "remove",               /* Specify emit/checking behavior for imports that are only used for types */
    // "downlevelIteration": true,                       /* Emit more compliant, but verbose and less performant JavaScript for iteration. */
    // "sourceRoot": "",                                 /* Specify the root path for debuggers to find the reference source code. */
    // "mapRoot": "",                                    /* Specify the location where debugger should locate map files instead of generated locations. */
    // "inlineSourceMap": true,                          /* Include sourcemap files inside the emitted JavaScript. */
    // "inlineSources": true,                            /* Include source code in the sourcemaps inside the emitted JavaScript. */
    // "emitBOM": true,                                  /* Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files. */
    // "newLine": "crlf",                                /* Set the newline character for emitting files. */
    // "stripInternal": true,                            /* Disable emitting declarations that have `@internal` in their JSDoc comments. */
    // "noEmitHelpers": true,                            /* Disable generating custom helper functions like `__extends` in compiled output. */
    // "noEmitOnError": true,                            /* Disable emitting files if any type checking errors are reported. */
    // "preserveConstEnums": true,                       /* Disable erasing `const enum` declarations in generated code. */
    // "declarationDir": "./",                           /* Specify the output directory for generated declaration files. */
    // "preserveValueImports": true,                     /* Preserve unused imported values in the JavaScript output that would otherwise be removed. */

    /* Interop Constraints */
    // "isolatedModules": true,                          /* Ensure that each file can be safely transpiled without relying on other imports. */
    // "allowSyntheticDefaultImports": true,             /* Allow 'import x from y' when a module doesn't have a default export. */
    "esModuleInterop": true,                             /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables `allowSyntheticDefaultImports` for type compatibility. */
    // "preserveSymlinks": true,                         /* Disable resolving symlinks to their realpath. This correlates to the same flag in node. */
    "forceConsistentCasingInFileNames": true,            /* Ensure that casing is correct in imports. */

    /* Type Checking */
    "strict": true,                                      /* Enable all strict type-checking options. */
    // "noImplicitAny": true,                            /* Enable error reporting for expressions and declarations with an implied `any` type.. */
    // "strictNullChecks": true,                         /* When type checking, take into account `null` and `undefined`. */
    // "strictFunctionTypes": true,                      /* When assigning functions, check to ensure parameters and the return values are subtype-compatible. */
    // "strictBindCallApply": true,                      /* Check that the arguments for `bind`, `call`, and `apply` methods match the original function. */
    // "strictPropertyInitialization": true,             /* Check for class properties that are declared but not set in the constructor. */
    // "noImplicitThis": true,                           /* Enable error reporting when `this` is given the type `any`. */
    // "useUnknownInCatchVariables": true,               /* Type catch clause variables as 'unknown' instead of 'any'. */
    // "alwaysStrict": true,                             /* Ensure 'use strict' is always emitted. */
    // "noUnusedLocals": true,                           /* Enable error reporting when a local variables aren't read. */
    // "noUnusedParameters": true,                       /* Raise an error when a function parameter isn't read */
    // "exactOptionalPropertyTypes": true,               /* Interpret optional property types as written, rather than adding 'undefined'. */
    // "noImplicitReturns": true,                        /* Enable error reporting for codepaths that do not explicitly return in a function. */
    // "noFallthroughCasesInSwitch": true,               /* Enable error reporting for fallthrough cases in switch statements. */
    // "noUncheckedIndexedAccess": true,                 /* Include 'undefined' in index signature results */
    // "noImplicitOverride": true,                       /* Ensure overriding members in derived classes are marked with an override modifier. */
    // "noPropertyAccessFromIndexSignature": true,       /* Enforces using indexed accessors for keys declared using an indexed type */
    // "allowUnusedLabels": true,                        /* Disable error reporting for unused labels. */
    // "allowUnreachableCode": true,                     /* Disable error reporting for unreachable code. */

    /* Completeness */
    // "skipDefaultLibCheck": true,                      /* Skip type checking .d.ts files that are included with TypeScript. */
    "skipLibCheck": true                                 /* Skip type checking all .d.ts files. */
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}

```

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

While creating the client, the important thing is the "rejectUnauthorized: false" side. If the rejectUnauthorized is true, the axios throws the 'DEPTH_ZERO_SELF_SIGNED_CERT' error. If you are working with a server with its own self-signed certificate set the rejectUnauthorized false. It can cause some problems later.

# Compiling and running

Compiling the project.

```bash
tsc
```

Running the app.

```bash
node build/app.js
```

Running the client.

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

Contact me:

- [Linkedin](https://www.linkedin.com/in/cengiz-berat-din%C3%A7kan-ab4208128/)

- [twitter](https://twitter.com/dinckan_berat)

- [github](https://github.com/pandashavenobugs)
