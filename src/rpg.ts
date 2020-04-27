import { Config } from "./config/config.js"
import { Character } from "./character.js"
import { Gamemap } from "./gamemap.js"
import { CharacterDrawer } from "./characterDrawer.js"
import { Communication } from "./communication/communication.js"

export module RPG {

    // Global variables
    export let joueur: Character
    export let map: Gamemap
    export const DIRECTION = {
        UP: 0,
        LEFT: 1,
        DOWN: 2,
        RIGHT: 3
    }

    const messageUser: string = "User"
    const messageDir: string = "Dir"

    const connectedCharsToDraw: any[] = []

    // 
    // Handle messages from the server
    // 
    export function handleOpen(): void {
        $('#logs').append('Connection established!</br>')
    }

    // When the user connects to the entity
    export function handleMessageLaunch(value: string): void {
        let playerData = parseJson(value)
        initGame()
        initPlayer(playerData)
        initGamemap(playerData)
    }

    // Load all the dynamic elements of the current map of the player
    // For example, the other connected characters
    export function handleMessageMap(value: any): void {
        let connectedCharactersData = parseJson(value)
        for (let characterData of connectedCharactersData) {
            if (characterData.name == joueur.name) {
                continue
            }
            addCharacter(characterData)
        }
    }

    // When a new character arrives into the current map of the player
    export function handleMessageComing(value: any): void {
        let characterData = parseJson(value)
        if (characterData.name != joueur.name && characterData.GamemapID == joueur.gamemapID) {
            addCharacter(characterData)
        }
        $('#logs').append(characterData.name + ' just arrived, say hello!' + '</br>')
    }

    // When another character moves
    export function handleMessageMove(value: any): void {
        value = parseJson(value)
        for (let character of map.characters) {
            if (character.name == value[messageUser] && value[messageUser] !== joueur.name) {
                character.move(value[messageDir], map, false)
            }
        }
    }

    // When another user leaves the entity
    export function handleMessageDisconnect(value: any): void {
        for (let i = 0; i < map.characters.length; ++i) {
            if (map.characters[i].name == value) {
                map.characters.splice(i, 1)
            }
        }
    }

    export function handleMessageTP(value: any): void {
        value = JSON.parse(value)
        let currentChar = value

        for (let i = 0; i < map.characters.length; ++i) {
            if (map.characters[i].name == currentChar.name && currentChar.name !== joueur.name && currentChar.GamemapID != joueur.gamemapID) {
                map.characters.splice(i, 1)
            } else if (map.characters[i].name == currentChar.name && currentChar.name == joueur.name) {
                initPlayer(currentChar)
                initGamemap(currentChar)
            }
        }
    }

    function initPlayer(playerData: any): void {
        joueur = new Character(parseInt(playerData.x), parseInt(playerData.y), DIRECTION.DOWN, playerData.name, playerData.GamemapID)
        connectedCharsToDraw.push([joueur, playerData.tileFormula])
    }

    function initGamemap(playerData: any): void {
        map = new Gamemap(0, 0, 0, 0, playerData.Gamemap.raw)
        map.loadLayers()
        CharacterDrawer.generate(joueur, playerData.tileFormula)
        map.addPersonnage(joueur)
    }

    // Add character to the game
    // Create a Character from the character data and draw it
    function addCharacter(character: any): void {
        let newChar = new Character(parseInt(character.x), parseInt(character.y), DIRECTION.DOWN, character.name, character.GamemapID)
        CharacterDrawer.generate(newChar, character.tileFormula)
        map.addPersonnage(newChar)
    }

    function parseJson(message: string): any {
        let m: any
        try {
            m = JSON.parse(message)
        } catch(e) {
            throw new Error("error while parsing message from server")
        }
        return m
    }
    
    // 
    // Canvas and keyboard management
    // 
    export function initGame (): void {
        $('#canvas').ready(() => {
            initCanvas()
            initKeyboard()
        })
    }

    function initCanvas(): void {
        let canvas = document.getElementById('canvas') as HTMLCanvasElement
        let ctx = canvas.getContext('2d')
        if (!canvas || !ctx) {
            throw new Error("error while getting canvas")
        }

        canvas.width = Config.cWIdth
        canvas.height = Config.cHeight
    
        let debug = document.getElementById('debug') as HTMLCanvasElement
        let ctxDebug = debug.getContext('2d')
        if (!debug || !ctxDebug) {
            throw new Error("error while getting debug canvas")
        }
        
        setInterval(() => {
            map.drawMap(ctx!, ctxDebug!)
        }, 40)
    }

    function initKeyboard(): void {
        window.onkeydown = (event: any) => {
            // Retrieve the key code
            let e = event || window.event
            let key = e.which || e.keyCode
    
            // Handle keyboard inputs for player directions
            switch (key) {
                // Up arrow, z, w, Z, W
                case 38 : case 122 : case 119 : case 90 : case 87 :
                    movePlayer(DIRECTION.UP)
                    break
                // Down arrow, s, S
                case 40 : case 115 : case 83 :
                    movePlayer(DIRECTION.DOWN)
                    break
                // Left arrow, q, a, Q, A
                case 37 : case 113 : case 97 : case 81 : case 65 :
                    movePlayer(DIRECTION.LEFT)
                    break
                // Right arrow, d, D
                case 39 : case 100 : case 68 :
                    movePlayer(DIRECTION.RIGHT)
                    break
                // If the key is not used in the entity, we don't need to block its normal behavior
                default :
                    return true
            }
            return false
        }
    }

    // Communicate with the server about a player movement
    // Should be in communication.js
    function movePlayer (movement: number): void {
        // Try to move the character
        // If false is returned, the move couldn't be processed
        if (!joueur.move(movement, map, true)) {
            return
        }

        if (map.neighbors) {
            let isTP = map.isNeighbor(joueur, movement)
            if (isTP) {
                Communication.sendTPMessage(movement, joueur.name, isTP)
                return
            }
        }
        Communication.sendMoveMessage(movement)
    }
}
