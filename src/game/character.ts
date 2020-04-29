import { Config } from "../config"
import { Gamemap } from "./gamemap"
import { CharacterDrawer } from "./characterDrawer"

let ANIMATION_LENGTH = 1
let MOVEMENT_LENGTH = 10
let TILESET_WIDTH = 13
let TILESET_HEIGHT = 21
let ROW_MOVEMENT = 8

export class Character {
    x: number
    y: number
    direction: any
    name: string
    stateAnimation: number
    gamemapID: number
    image: HTMLImageElement

    constructor(x: number, y: number, direction: any, nickname: string, gamemapID: number) {
        this.x = x
        this.y = y
        this.direction = direction
        this.stateAnimation = -1
        this.name = nickname
        this.gamemapID = gamemapID
        this.image = new Image()
    }

    public drawCharacter(context: CanvasRenderingContext2D, joueur: Character, map: Gamemap): void {
        // Image's number to take for the animation
        let frame = 0

        // Offset to apply to the entity's position
        let offsetX = 0, offsetY = 0

        if(this.stateAnimation >= MOVEMENT_LENGTH) {
            // Abort the movement if the timer is done
            this.stateAnimation = -1

            // Initialize the map translation when the main entity is drawn
            if(this === joueur) {
                map.camX = map.clamp(-(-(joueur.x * Config.tileSize) + Config.cWIdth/2), 0, map.width * Config.tileSize - Config.cWIdth)
                map.camY = map.clamp(-(-(joueur.y * Config.tileSize) + Config.cHeight/2), 0, map.height * Config.tileSize - Config.cHeight)
            }
        } else if(this.stateAnimation >= 0) {
            // Determine the image (frame) to display for the animation
            frame = Math.floor(this.stateAnimation / ANIMATION_LENGTH)
            if(frame > 8) { //3
                frame %= 9 //4
            }

            // Pixels count left to proceed
            let pixelsAParcourir = 32 - (32 * (this.stateAnimation / MOVEMENT_LENGTH))

            // From this number, decide the offset for x & y
            if (this.direction == Config.DIRECTION.UP) {
                offsetY = pixelsAParcourir
            } else if (this.direction == Config.DIRECTION.DOWN) {
                offsetY = -pixelsAParcourir
            } else if (this.direction == Config.DIRECTION.LEFT) {
                offsetX = pixelsAParcourir
            } else if (this.direction == Config.DIRECTION.RIGHT) {
                offsetX = -pixelsAParcourir
            }

            // One more frame
            this.stateAnimation++

            let tempocamX = map.clamp(-(-(joueur.x * Config.tileSize) + Config.cWIdth/2), 0, map.width * Config.tileSize - Config.cWIdth)
            let tempocamY = map.clamp(-(-(joueur.y * Config.tileSize) + Config.cHeight/2), 0, map.height * Config.tileSize - Config.cHeight)

            if (tempocamX != map.camX || tempocamY != map.camY) {
                map.camX = tempocamX + Math.round(offsetX)
                map.camY = tempocamY + Math.round(offsetY)
            }
        }

        // If both conditions are false, means that the user is not moving, so we keep the value 0
        // for the following variables: frame, offsetX, offsetY
        if (this.image.width > 0 &&  this.image.height > 0) {
            context.drawImage(
                this.image,
                this.width() * frame, this.direction * this.height() + this.height() * ROW_MOVEMENT, // Source rectangle's origin point to take in our image
                this.width(), this.height(), // Source rectangle's size (our entity's size)
                // Destination point (depends upon entity's size)
                (this.x * 32) - (this.width() / 2) + 16 + offsetX, (this.y * 32) - this.height() + 24 + offsetY,
                this.width(), this.height() // Destination rectangle's size (our entity's size)
            )
        }
        context.fillText(this.name,(this.x * 32) - (this.width() / 2) + 16 + offsetX, (this.y * 32) - this.height() + 24 + offsetY + 5)
    }

    public generate(json: any): void {
        CharacterDrawer.generate(this.image, json)
    }

    public move(direction: any, map: Gamemap, mainChar: boolean): boolean {
        // If a movement is already proceeding, we refuse the movement
        if (mainChar && this.stateAnimation >= 0) {
            return false
        }

        // Change the character's current direction
        this.direction = direction
        let nextPos = this.nextPosition(direction)

        // Check if the next position is in the map
        if (nextPos.x < 0 || nextPos.y < 0 || nextPos.x >= map.width || nextPos.y >= map.height) {
            // returns false telling that the movement didn't proceed
            return false
        }

        // Check if the next position is an obstacle
        if (map.isObstacle(nextPos)) {
            return false
        }

        // Start the animation
        this.stateAnimation = 1

        // Proceed the movement
        this.x = nextPos.x
        this.y = nextPos.y
        return true
    }

    public nextPosition(direction: number):  {'x' : number, 'y' : number} {
        let coord = {'x' : this.x, 'y' : this.y}
        if (direction == Config.DIRECTION.DOWN) {
            coord.y++
        }
        else if (direction == Config.DIRECTION.LEFT) {
            coord.x--
        }
        else if (direction == Config.DIRECTION.RIGHT) {
            coord.x++
        }
        else if (direction == Config.DIRECTION.UP) {
            coord.y--
        }
        return coord
    }

    private width(): number {
        if (!this.image) {
            return 0
        }
        return this.image.width / TILESET_WIDTH
    }

    private height(): number {
        if (!this.image) {
            return 0
        }
        return this.image.height / TILESET_HEIGHT
    }
}