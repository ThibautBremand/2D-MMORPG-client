// let tileSize = 32
// let cWIdth = 25 * tileSize
// let cHeight = 20 * tileSize
// let joueur: Character
// let map: Gamemap
// let RPGstate = new RPG(tileSize, cWIdth, cHeight)
// let characterDrawer = new CharacterDrawer()

import { Communication } from "./src/communication.js"

let username = prompt('Enter your name', '')
if (!username) {
    throw new Error ("couldn't get the entered username")
}

Communication.init(username)