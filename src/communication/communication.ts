import { RPG } from '../controller'

const keyOutMove = 's_MOVE'
const keyOutTP = 's_TP'

const keyInLaunch = 'c_LAUNCH'
const keyInMap = 'c_MAP'
const keyInComing = 'c_COMING'
const keyInMove = 'c_MOVE'
const keyInDisconnect = 'c_DISCONNECT'
const keyInTP = 'c_TP'

const messageKey: string = 'Key'
const messageValue: string = 'Value'

export let conn: WebSocket
export let name: string

export function init(username: string): void {
    name = username
    conn = new WebSocket('ws://' + document.location.host + '/ws?name=' + name)
    conn.onopen = open
    conn.onmessage = (e) => {
        message(e)
    }
}

function open(): void {
    RPG.handleOpen()
}

//
// Listen to the WebSocket and handle messages received from the server
//
function message(e: MessageEvent): void {
    const strLines = e.data.split('\n')
    for (const line of strLines) {
        const { key, value } = parseMessage(line)
        switch (key) {
            case keyInLaunch:
                RPG.handleMessageLaunch(value)
                break
            case keyInMap:
                RPG.handleMessageMap(value)
                break
            case keyInComing:
                RPG.handleMessageComing(value)
                break
            case keyInMove:
                RPG.handleMessageMove(value)
                break
            case keyInDisconnect:
                RPG.handleMessageDisconnect(value)
                break
            case keyInTP:
                RPG.handleMessageTP(value)
                break
            default:
                break
        }
    }
}

function parseMessage(inboundMessage: string): { key: any, value: any } {
    const m = parseJson(inboundMessage)

    if (messageKey in m && messageValue in m) {
        const key = m[messageKey]
        const value = m[messageValue]
        return { key, value }
    }
    throw new Error('error while parsing message from server')
}

//
// Functions to send messages to the server
//
export function sendMoveMessage(movement: number): void {
    const moveMessage = JSON.stringify({
        Key: keyOutMove,
        Value: {
            Dir: movement,
            User: getUsername()
        }
    })
    send(moveMessage)
}

export function sendTPMessage(movement: number, characterName: string, TPData: string): void {
    const TPMessage = JSON.stringify({
        Key: keyOutTP,
        Value: {
            Dir: movement,
            User: characterName,
            newMap: TPData
        }
    })
    send(TPMessage)
}

function send(outboundMessage: string): void {
    conn.send(outboundMessage)
}

function getUsername(): string {
    return name
}

function parseJson(json: string): any {
    let m: any
    try {
        m = JSON.parse(json)
    } catch(e) {
        throw new Error('error while parsing json message from server')
    }
    return m
}