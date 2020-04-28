import { Gamemap } from "./gamemap.js"
import { Config } from "./config/config.js"

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
    etatAnimation: number
    gamemapID: number
    image: any

    constructor(x: number, y: number, direction: any, nickname: string, gamemapID: number) {
        this.x = x
        this.y = y
        this.direction = direction
        this.etatAnimation = -1
        this.name = nickname
        this.gamemapID = gamemapID
        this.image = new Image()
        this.image.characterReference = this
    }

    public drawCharacter(context: CanvasRenderingContext2D, joueur: Character, map: Gamemap): void {
        // Image's number to take for the animation
        let frame = 0

        // Offset to apply to the entity's position
        let decalageX = 0, decalageY = 0

        if(this.etatAnimation >= MOVEMENT_LENGTH) {
            // Aborts the movement if the timer is done
            this.etatAnimation = -1;

            // Initializes the map translation when the main entity is drawn
            if(this === joueur) {
                map.camX = map.clamp(-(-(joueur.x * Config.tileSize) + Config.cWIdth/2), 0, map.width * Config.tileSize - Config.cWIdth);
                map.camY = map.clamp(-(-(joueur.y * Config.tileSize) + Config.cHeight/2), 0, map.height * Config.tileSize - Config.cHeight);
            }
        } else if(this.etatAnimation >= 0) {
            // Determines the image (frame) to display for the animation
            frame = Math.floor(this.etatAnimation / ANIMATION_LENGTH);
            if(frame > 8) { //3
                frame %= 9; //4
            }

            // Pixels count left to proceed
            let pixelsAParcourir = 32 - (32 * (this.etatAnimation / MOVEMENT_LENGTH));

            // From this number, decides the offset for x & y
            if(this.direction == Config.DIRECTION.UP) {
                decalageY = pixelsAParcourir;
            } else if(this.direction == Config.DIRECTION.DOWN) {
                decalageY = -pixelsAParcourir;
            } else if(this.direction == Config.DIRECTION.LEFT) {
                decalageX = pixelsAParcourir;
            } else if(this.direction == Config.DIRECTION.RIGHT) {
                decalageX = -pixelsAParcourir;
            }

            // One more frame
            this.etatAnimation++;

            let tempocamX = map.clamp(-(-(joueur.x * Config.tileSize) + Config.cWIdth/2), 0, map.width * Config.tileSize - Config.cWIdth);
            let tempocamY = map.clamp(-(-(joueur.y * Config.tileSize) + Config.cHeight/2), 0, map.height * Config.tileSize - Config.cHeight);

            if (tempocamX != map.camX || tempocamY != map.camY) {
                map.camX = tempocamX + Math.round(decalageX);
                map.camY = tempocamY + Math.round(decalageY);
            }
        }

        /*
         * If both conditions are false, means that the user is not moving
         * so we keep the value 0 for the following variables
         * frame, decalageX et decalageY
         */

        if ( this.image != null && this.image.width > 0 ) {
            this.image.characterReference.largeur = this.image.width / TILESET_WIDTH;
        }
        if ( this.image != null && this.image.height > 0 ) {
            this.image.characterReference.hauteur = this.image.height / TILESET_HEIGHT;
        }
        if ( this.image.width > 0 &&  this.image.height > 0) {
            context.drawImage(
                this.image,
                this.image.characterReference.largeur * frame, this.direction * this.image.characterReference.hauteur + this.image.characterReference.hauteur * ROW_MOVEMENT, // Source rectangle's origin point to take in our image
                this.image.characterReference.largeur, this.image.characterReference.hauteur, // Source rectangle's size (our entity's size)
                // Destination point (depends upon entity's size)
                (this.x * 32) - (this.image.characterReference.largeur / 2) + 16 + decalageX, (this.y * 32) - this.image.characterReference.hauteur + 24 + decalageY,
                this.image.characterReference.largeur, this.image.characterReference.hauteur // Destination rectangle's size (our entity's size)
            );
        }
        context.fillText(this.name,(this.x * 32) - (this.image.characterReference.largeur / 2) + 16 + decalageX, (this.y * 32) - this.image.characterReference.hauteur + 24 + decalageY + 5);
    }

    public move(direction: any, map: Gamemap, mainChar: boolean): boolean {
        // If a movement is already proceeding, we refuse the movement
        if (mainChar && this.etatAnimation >= 0) {
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
        this.etatAnimation = 1

        // Proceed the movement
        this.x = nextPos.x
        this.y = nextPos.y
        return true
    }

    public nextPosition(direction: number):  {'x' : number, 'y' : number} {
        let coord = {'x' : this.x, 'y' : this.y}
        if ( direction == Config.DIRECTION.DOWN ) {
            coord.y++
        }
        else if ( direction == Config.DIRECTION.LEFT ) {
            coord.x--
        }
        else if ( direction == Config.DIRECTION.RIGHT ) {
            coord.x++
        }
        else if ( direction == Config.DIRECTION.UP ) {
            coord.y--
        }
        return coord
    }
}