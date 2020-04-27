import { Communication } from "./src/communication/communication.js"

let username = prompt('Enter your name', '')
if (!username) {
    throw new Error ("couldn't get the entered username")
}

Communication.init(username)