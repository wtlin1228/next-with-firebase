# Deploy NextJS to Firebase Functions

## Usages

### Installment

`yarn install`

### Development

`yarn dev`

### Build

`yarn build`

### Deploy

`yarn deploy`

## Put next project into `src/client`

```json
// project structure
.
└── src
    └── client // the next project
        ├── components
        ├── pages
        ├── .gitignore
        ├── next.config.js
        └── package.json  
```

```jsx
// src/client/next.config.js
module.exports = {
  distDir: "../../dist/client"
}
```

```json
// src/client/package.json
{
  "name": "app",
  "version": "1.0.0",
  "main": "dist/server/index.js",
  "engines": {
		// firebase only support node 8(recommanded) and node 10 
    // but next need node 10, so I choose node 10
    "node": "10" 
  },
  "dependencies": {
    "next": "^9.3.6",
    "react": "^16.13.1",
    "react-dom": "^16.13.1"
  }
}
```

## Put firebase functions into `src/server`

```json
// project structure
.
└── src
    ├── client // the next project
    └── server // the firebase functions
        ├── .babelrc // use babel to compile code into node 10
        └── index.js
        
```

```json
// src/server/.babelrc
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "10.20.1"
        }
      }
    ]
  ]
}
```

```jsx
// src/server/index.js
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import next from "next";

admin.initializeApp();

const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
  // the absolute directory from the package.json file that initialises this module
  // IE: the absolute path from the root of the Cloud Function
  conf: { distDir: "dist/client" },
});
const handle = app.getRequestHandler();

export const server = functions.https.onRequest((request, response) => {
  // log the page.js file or resource being requested
  console.log("File: " + request.originalUrl);
  return app.prepare().then(() => handle(request, response));
});
```

## Build Client and Server into `dist`

### Install dependency

`nvm use 10.20.1`

`yarn add next react react-dom`

`yarn add firebase-admin firebase-functions`

`yarn add -D @babel/cli @babel/core @babel/preset-env cross-env rimraf`

### Configure `package.json`

```json
{
  "name": "next-with-firebase",
  "version": "1.0.0",
  "main": "dist/server/index.js",
  "engines": {
    "node": "10"
  },
  "license": "MIT",
  "scripts": {
    "dev:client": "next src/client",
    "dev:server": "babel src/server --out-dir dist/server --source-maps --watch",
    "dev": "npm run dev:client & npm run dev:server",
    "build:client": "next build src/client",
    "build:server": "babel src/server --out-dir dist/server --source-maps",
    "build": "npm run build:client && npm run build:server",
    "preserve": "npm run build",
    "serve": "cross-env NODE_ENV=production firebase serve --only functions,hosting",
    "predeploy": "rimraf dist/ && npm run build",
    "deploy": "cross-env NODE_ENV=production firebase deploy --only functions,hosting"
  },
  "devDependencies": {
    "@babel/cli": "^7.8.4",
    "@babel/core": "^7.9.6",
    "@babel/preset-env": "^7.9.6",
    "cross-env": "^7.0.2",
    "rimraf": "^3.0.2"
  },
  "dependencies": {
    "firebase-admin": "^8.12.1",
    "firebase-functions": "^3.6.1",
    "next": "^9.3.6",
    "react": "^16.13.1",
    "react-dom": "^16.13.1"
  }
}
```

## Setup Firebase

### Initialize Firebase

`firebase init`

Choose one of your existing firebase project.

Don't install the firebase dependencies during the initializing process.

### Configure `firebase.json`

```json
{
  "hosting": {
    "public": "public",
    "rewrites": [
      {
        "source": "**/**",
        "function": "server"
      }
    ]
  },
  "functions": {
    "source": ".",
    "ignore": [
      ".firebase/**",
      ".firebaserc",
      "firebase.json",
      "**/node_modules/**",
      "**/public/**"
    ]
  }
}
```

## References:

- [https://codeburst.io/next-js-on-cloud-functions-for-firebase-with-firebase-hosting-7911465298f2](https://codeburst.io/next-js-on-cloud-functions-for-firebase-with-firebase-hosting-7911465298f2)
- [https://medium.com/@muccy/deploying-next-js-app-to-firebase-functions-eb473791d79e](https://medium.com/@muccy/deploying-next-js-app-to-firebase-functions-eb473791d79e)
- [https://github.com/zeit/next.js/issues/8893](https://github.com/zeit/next.js/issues/8893)