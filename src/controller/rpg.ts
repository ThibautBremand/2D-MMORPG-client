import { Config } from '../config'
import { Communication } from '../communication'
import { Character } from '../game'
import { Gamemap } from '../game'

// Global variables
export let player: Character
export let map: Gamemap

const messageUser: string = 'User'
const messageDir: string = 'Dir'

let characters: Map<string, Character> = new Map()

//
// Management of the messages coming from the server
//
export function handleOpen(): void {
    $('#logs').append('Connection established!</br>')
}

// When the user connects to the entity
export function handleMessageLaunch(value: string): void {
    const playerData = parseJson(value)
    initGame()
    initPlayer(playerData)
    initGamemap(playerData)
}

// Load all the dynamic elements of the current map of the player
// (for example, the other connected characters)
export function handleMessageMap(value: any): void {
    const connectedCharactersData = parseJson(value)
    for (const characterData of connectedCharactersData) {
        if (characterData.name === player.name) {
            continue
        }
        addCharacter(characterData)
    }
}

// When a new character arrives into the current map of the player
export function handleMessageComing(value: any): void {
    const characterData = parseJson(value)
    if (characterData.name !== player.name && characterData.GamemapID === player.gamemapID) {
        addCharacter(characterData)
    }
    $('#logs').append(characterData.name + ' just arrived, say hello!' + '</br>')
}

// When another character moves
export function handleMessageMove(value: any): void {
    value = parseJson(value)
    for (const [_, character] of characters) {
        if (character.name === value[messageUser] && value[messageUser] !== player.name) {
            character.move(value[messageDir], map, false)
        }
    }
}

// When another user leaves the entity
export function handleMessageDisconnect(value: any): void {
    characters.delete(value)
}

export function handleMessageTP(value: any): void {
    const currentChar = JSON.parse(value)

    if (currentChar.name !== player.name) {
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
        throw new Error('error while parsing message from server')
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
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    const ctx = canvas.getContext('2d')
    if (!canvas || !ctx) {
        throw new Error('error while getting canvas')
    }

    canvas.width = Config.cWIdth
    canvas.height = Config.cHeight

    const debug = document.getElementById('debug') as HTMLCanvasElement
    const ctxDebug = debug.getContext('2d')
    if (!debug || !ctxDebug) {
        throw new Error('error while getting debug canvas')
    }

    setInterval(() => {
        map.drawMap(ctx!)
        drawCharacter(ctx!)
    }, 40)
}

function initKeyboard(): void {
    window.onkeydown = (event: any) => {
        // Retrieve the key code
        const e = event || window.event
        const key = e.which || e.keyCode

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
    if (!player.move(direction, map, true)) {
        return
    }

    if (map.neighbors) {
        const isTP = map.isNeighbor(direction, player.nextPosition(direction))
        if (isTP) {
            Communication.sendTPMessage(direction, player.name, isTP)
            return
        }
    }
    Communication.sendMoveMessage(direction)
}

function drawCharacter(context: CanvasRenderingContext2D) {
    // Draw the characters
    for (const [_, character] of characters) {
        character.drawCharacter(context, player, map)
    }
}

//
// Game global state management
//
function initPlayer(playerData: any): void {
    player = new Character(Number(playerData.x), Number(playerData.y), Config.DIRECTION.DOWN, playerData.name, playerData.GamemapID)
}

function initGamemap(playerData: any): void {
    characters = new Map()

    map = new Gamemap(0, 0, 0, 0, playerData.Gamemap.raw)
    map.loadLayers()

    player.generate(playerData.tileFormula)

    characters.set(player.name, player)

    map.camX = map.clamp(-(-(player.x * Config.tileSize) + Config.cWIdth / 2), 0, map.width * Config.tileSize - Config.cWIdth)
    map.camY = map.clamp(-(-(player.y * Config.tileSize) + Config.cHeight / 2), 0, map.height * Config.tileSize - Config.cHeight)
}

// Add character to the game: create a Character from the character data and draw it
function addCharacter(character: any): void {
    const newChar = new Character(Number(character.x), Number(character.y), Config.DIRECTION.DOWN, character.name, character.GamemapID)

    newChar.generate(character.tileFormula)

    characters.set(newChar.name, newChar)
}