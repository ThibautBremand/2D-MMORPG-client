import { Config } from "./config/config.js"
import { Character } from "./character.js"
import { Gamemap } from "./gamemap.js"
import { CharacterDrawer } from "./characterDrawer.js"
import { Communication } from "./communication/communication.js"

export module RPG {

    // Global variables
    export let joueur: Character
    export let map: Gamemap

    const messageUser: string = "User"
    const messageDir: string = "Dir"

    let characters: Map<string, Character> = new Map()

    // 
    // Management of the messages coming from the server
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
    // (for example, the other connected characters)
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
        for (let [_, character] of characters) {
            if (character.name == value[messageUser] && value[messageUser] !== joueur.name) {
                character.move(value[messageDir], map, false)
            }
        }
    }

    // When another user leaves the entity
    export function handleMessageDisconnect(value: any): void {
        characters.delete(value)
    }

    export function handleMessageTP(value: any): void {
        let currentChar = JSON.parse(value)

        if (currentChar.name !== joueur.name) {
            characters.delete(currentChar.name)
            return
        }
        initPlayer(currentChar)
        initGamemap(currentChar)
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
            map.drawMap(ctx!)
            drawCharacter(ctx!, joueur, map)
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
                    movePlayer(Config.DIRECTION.UP)
                    break
                // Down arrow, s, S
                case 40 : case 115 : case 83 :
                    movePlayer(Config.DIRECTION.DOWN)
                    break
                // Left arrow, q, a, Q, A
                case 37 : case 113 : case 97 : case 81 : case 65 :
                    movePlayer(Config.DIRECTION.LEFT)
                    break
                // Right arrow, d, D
                case 39 : case 100 : case 68 :
                    movePlayer(Config.DIRECTION.RIGHT)
                    break
                // If the key is not used in the entity, we don't need to block its normal behavior
                default :
                    return true
            }
            return false
        }
    }

    function movePlayer (direction: number): void {
        // Try to move the character
        // If false is returned, the move couldn't be processed
        if (!joueur.move(direction, map, true)) {
            return
        }

        if (map.neighbors) {
            let isTP = map.isNeighbor(direction, joueur.nextPosition(direction))
            if (isTP) {
                Communication.sendTPMessage(direction, joueur.name, isTP)
                return
            }
        }
        Communication.sendMoveMessage(direction)
    }

    function drawCharacter(context: CanvasRenderingContext2D, joueur: Character, map: Gamemap) {
        // Draw the characters
        for (let [_, character] of characters) {
            character.drawCharacter(context, joueur, map)
        }
    }

    // 
    // Game global state management
    // 
    function initPlayer(playerData: any): void {
        joueur = new Character(parseInt(playerData.x), parseInt(playerData.y), Config.DIRECTION.DOWN, playerData.name, playerData.GamemapID)
    }

    function initGamemap(playerData: any): void {
        characters = new Map()

        map = new Gamemap(0, 0, 0, 0, playerData.Gamemap.raw)
        map.loadLayers()

        CharacterDrawer.generate(joueur, playerData.tileFormula)

        characters.set(joueur.name, joueur)

        map.camX = map.clamp(-(-(joueur.x * Config.tileSize) + Config.cWIdth / 2), 0, map.width * Config.tileSize - Config.cWIdth)
        map.camY = map.clamp(-(-(joueur.y * Config.tileSize) + Config.cHeight / 2), 0, map.height * Config.tileSize - Config.cHeight)
    }

    // Add character to the game: create a Character from the character data and draw it
    function addCharacter(character: any): void {
        let newChar = new Character(parseInt(character.x), parseInt(character.y), Config.DIRECTION.DOWN, character.name, character.GamemapID)

        CharacterDrawer.generate(newChar, character.tileFormula)
        
        characters.set(newChar.name, newChar)
    }
}
