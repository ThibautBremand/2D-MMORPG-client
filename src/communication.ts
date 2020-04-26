import { Character } from "./character.js"
import { Gamemap } from "./gamemap.js"
import { RPG } from "./rpg.js"
import { CharacterDrawer } from "./characterDrawer.js"

export module Communication {
    export let tileSize = 32
    export let cWIdth = 25 * tileSize
    export let cHeight = 20 * tileSize

    export let conn: WebSocket
    export let joueur: Character
    export let name: string
    let connectedCharsToDraw: any[] = []
    export let map: Gamemap
    let RPGstate = new RPG(tileSize, cWIdth, cHeight)

    export const DIRECTION = {
        DOWN: 2,
        LEFT: 1,
        RIGHT: 3,
        UP: 0
    }

    export function init(username: string): void {
        name = username
        conn = new WebSocket("ws://" + document.location.host + "/ws?name=" + name)
        conn.onopen = handleOpen
        conn.onmessage = (e) => {
            handleMessage(e)
        }
    }

    function handleOpen(): void {
        $('#logs').append('Connection established!</br>')
    }

    // Listen to the WebSocket and handle different types of messages
    function handleMessage(e: MessageEvent): void {
        let strLines = e.data.split("\n");
        for (let line of strLines) {
            let message = JSON.parse(line)
            let key = message["Key"]
            let value = message["Value"]
    
            switch (key) {
                case 'c_LAUNCH':
                    handleMessageLaunch(value)
                    break
                case 'c_MAP':
                    handleMessageMap(value)
                    break
                case 'c_COMING':
                    handleMessageComing(value)
                    break
                case 'c_MOVE':
                    handleMessageMove(value)
                    break
                case 'c_DISCONNECT':
                    handleMessageDisconnect(value)
                    break
                case 'c_TP':
                    handleMessageTP(value)
                    break
                default:
                    break
            }
        }
    }

    // When the user connects to the entity
    function handleMessageLaunch(value: any): void {
        RPGstate.initGame()
        let currentChar = JSON.parse(value)
        joueur = new Character(parseInt(currentChar.x), parseInt(currentChar.y), DIRECTION.DOWN, currentChar.name, currentChar.GamemapID)
        connectedCharsToDraw.push([joueur, currentChar.tileFormula])
    
        map = new Gamemap(0, 0, 0, 0, currentChar.Gamemap.raw)
        map.loadLayers()
        CharacterDrawer.generate(joueur, currentChar.tileFormula)
        map.addPersonnage(joueur)
    }

    // Load all the dynamic elements of the current map of the player
    // For example, the other connected characters
    function handleMessageMap(value: any): void {
        let connectedCharacters = JSON.parse(value)
        for (let currentChar of connectedCharacters) {
            if (currentChar.name == joueur.name) {
                continue
            }
            let newChar = new Character(parseInt(currentChar.x), parseInt(currentChar.y), DIRECTION.DOWN, currentChar.name, currentChar.GamemapID)
            CharacterDrawer.generate(newChar, currentChar.tileFormula)
            map.addPersonnage(newChar)
        }
    }

    // When a new character arrives into the current map of the player
    function handleMessageComing(value: any): void {
        let currentChar = JSON.parse(value)
        if (currentChar.name != joueur.name && currentChar.GamemapID == joueur.gamemapID) {
            let newChar = new Character(parseInt(currentChar.x), parseInt(currentChar.y), DIRECTION.DOWN, currentChar.name, currentChar.GamemapID)
            CharacterDrawer.generate(newChar, currentChar.tileFormula)
            map.addPersonnage(newChar)
        }

        $('#logs').append(currentChar.name + ' just logged in !' + '</br>')
    }

    // When another character moves
    function handleMessageMove(value: any): void {
        value = JSON.parse(value)
        for (let i = 0; i < map.characters.length; ++i) {
            if (map.characters[i].name == value["User"] && value["User"] !== joueur.name) {
                map.characters[i].move(value["Dir"], map, false)
            }
        }
    }

    // When another user leaves the entity
    function handleMessageDisconnect(value: any): void {
        for (let i = 0; i < map.characters.length; ++i) {
            if (map.characters[i].name == value) {
                map.characters.splice(i, 1)
            }
        }
    }

    function handleMessageTP(value: any): void {
        value = JSON.parse(value)
        let currentChar = value

        for (let i = 0; i < map.characters.length; ++i) {
            if (map.characters[i].name == currentChar.name && currentChar.name !== joueur.name && currentChar.GamemapID != joueur.gamemapID) {
                map.characters.splice(i, 1)
            }
    
            else if (map.characters[i].name == currentChar.name && currentChar.name == joueur.name) {
                joueur = new Character(parseInt(currentChar.x), parseInt(currentChar.y), DIRECTION.DOWN, currentChar.name, currentChar.GamemapID)
                connectedCharsToDraw.push([joueur, currentChar.tileFormula])
            
                map = new Gamemap(0, 0, 0, 0, currentChar.Gamemap.raw)
                map.loadLayers()
                CharacterDrawer.generate(joueur, currentChar.tileFormula)
                map.addPersonnage(joueur)
            }
        }
    }
}