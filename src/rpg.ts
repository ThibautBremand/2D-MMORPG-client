import { Communication } from "./communication.js"

export class RPG {
    tileSize: number
    cWIdth: number
    cHeight: number

    constructor(tileSize: number, cWIdth: number, cHeight: number) {
        this.tileSize = tileSize
        this.cWIdth = cWIdth
        this.cHeight = cHeight
    }

    public initGame () {
        $('#canvas').ready(() => {
            this.initCanvas()
            this.initKeyboard()
        })
    }

    public initCanvas(): void {
        let canvas = document.getElementById('canvas') as HTMLCanvasElement
        let ctx = canvas.getContext('2d')

        if (!canvas || !ctx) {
            throw new Error("error while getting canvas")
        }

        canvas.width = this.cWIdth
        canvas.height = this.cHeight
    
        let debug = document.getElementById('debug') as HTMLCanvasElement
        let ctxDebug = debug.getContext('2d')

        if (!debug || !ctxDebug) {
            throw new Error("error while getting debug canvas")
        }
        setInterval(() => {
            Communication.map.drawMap(ctx!, ctxDebug!)
        }, 40)
    }

    public initKeyboard() {
        window.onkeydown = function (event: any) {
            // Retrieve the key code
            let e = event || window.event
            let key = e.which || e.keyCode
    
            // Handle keyboard inputs for player directions
            switch (key) {
                case 38 : case 122 : case 119 : case 90 : case 87 : // Up arrow, z, w, Z, W
                    handleMovement(Communication.DIRECTION.UP)
                    break
                case 40 : case 115 : case 83 : // Down arrow, s, S
                    handleMovement(Communication.DIRECTION.DOWN)
                    break
                case 37 : case 113 : case 97 : case 81 : case 65 : // Left arrow, q, a, Q, A
                    handleMovement(Communication.DIRECTION.LEFT)
                    break
                case 39 : case 100 : case 68 : // Right arrow, d, D
                    handleMovement(Communication.DIRECTION.RIGHT)
                    break
                default : // If the key is not used in the entity, we don't need to block its normal behavior
                    return true
            }
            return false
        }
    }
}

// Communicate with the server about a player movement
// Should be in communication.js
function handleMovement (movement: number) {
    if (Communication.joueur.move(movement, Communication.map, true)) {
        let isTP
        if (Communication.map.neighbors) {
            isTP = Communication.map.isNeighbor(Communication.joueur, movement)
            if (isTP) {
                let strMessage = JSON.stringify({
                    Key: "s_TP",
                    Value: {
                        Dir: movement,
                        User: Communication.joueur.name,
                        newMap: isTP
                    }
                })
                Communication.conn.send(strMessage)
                return
            }
        } 
        let strMovement = JSON.stringify({
            Key: "s_MOVE",
            Value: {
                Dir: movement,
                User: Communication.name
            }
        })
        Communication.conn.send(strMovement)
    }
}