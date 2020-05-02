# 2D-MMORPG-client
The client for 2D-MMORPG, written in TypeScript.

For the server, please see https://github.com/ThibautBremand/2D-MMORPG-server

This client displays the game as canvas in the user's browser, it handles user's inputs from the keyboard, and it interacts with the server in order to communicate with the other users.

## Demo!  
Go to http://51.91.158.243:8080/ and start playing using these usernames:
- demo
- demo2

You can also create new characters using the following page: http://51.91.158.243:8080/character

## Local installation

- Clone the repo
- Run *git submodule update --init --recursive* in order to clone the submodules.
- Create a *.env* environment variables file using the *.env.sample* as a model. Don't use any separator.
  - **Note:** DEPLOY_PATH value must correspond to the CLIENT_PATH value of the server. That way, once you deploy the client, it'll be directly served by the server to the users (cf. https://github.com/ThibautBremand/2D-MMORPG-server).
- Run *npm i* to install all the dependencies
- Run *npm run build* in order to generate a bundled *app.js* JavaScript file, into the *dist* directory
- Run *npm run deploy* to deploy the client into DEPLOY_PATH directory.

To add new tilesets, you need to directly copy the image files into the *dist/tilesets* directory. They'll be deployed automatically using *npm run deploy*.

## Create a new map and a new character
Please refer to this [Wiki page](https://github.com/ThibautBremand/2D-MMORPG-client/wiki/Create-new-maps).

## Troubleshooting

Make sure you have the following elements installed on your system:
- Node.js
- npm

Also, the following elements are mandatory but should be installed with npm i:
- TypeScript
- webpack

Also make sure you have correctly filled your .env file.

## 2k20 Reborn!
This project is a new version of this one made in pure JS, in 2015:
https://github.com/ThibautBremand/WebApp_WebMMORPG-Client

The previous project is now deprecated.