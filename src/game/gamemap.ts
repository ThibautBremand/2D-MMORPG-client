import { Config } from "../config"
import { Tileset } from "./tileset"

export class Gamemap {
    mapToDraw: any
    height: number
    width: number
    layers: any[]
    tilesets: Tileset[]
    collisions: any[]
    neighbors: any[]
    camX: number
    camY: number

    constructor(height: number, width: number, camX: number, camY: number, json: string) {
        this.mapToDraw = JSON.parse(json)
        this.height = height
        this.width = width
        this.camX = camX
        this.camY = camY
        this.layers = new Array()
        this.tilesets = new Array()
        this.collisions = new Array()
        this.neighbors = new Array()
    }

    // Load the layers from the json files given
    public loadLayers(): void {
        // Retrieve all the layers for the map
        let layers = this.mapToDraw.layers
        // Retrieve tileset
        let tilesets = this.mapToDraw.tilesets
        for (let i = 0; i < tilesets.length; ++i) {
            let image = tilesets[i].image
            image = image.substring(image.search('/tilesets/') + '/tilesets/'.length, image.length)

            this.height = this.mapToDraw.layers[i].height
            this.width = this.mapToDraw.layers[i].width

            this.tilesets.push(new Tileset(image, tilesets[i].firstgid))
        }

        for (let i = 0; i < layers.length; ++i) {
            if (layers[i].name == 'Collisions') {
                this.collisions = layers[i].objects
            } else if (layers[i].name.substr(0, 3) == 'MAP') {
                this.neighbors.push(layers[i])
            } else {
                this.layers.push(layers[i].data)
            }
        }
    }

    // Draw the object Map
    public drawMap(context: CanvasRenderingContext2D): void {
        context.setTransform(1, 0, 0, 1, 0, 0)// reset the transform matrix as it is cumulative
        context.clearRect(0, 0, Config.cWIdth, Config.cHeight)// clear the viewport AFTER the matrix is reset

        // Clamp the camera position to the world bounds while centering the camera around the player
        this.translate(-this.camX, -this.camY, context)

        // Draw the layers
        for (let currMap = 0; currMap < this.layers.length; ++currMap) {
            let cpt = 0
            for (let j = 0; j < this.height; ++j) {
                for (let i = 0; i < this.width; ++i) {
                    let currentTile = this.layers[currMap][cpt]
                    if (currentTile > 0) {
                        this.electAndDrawTile(currentTile, context, i, j)
                    }
                    cpt++
                }
            }
        }
    }

    public clamp(value: number, min: number, max: number): number {
        if (value < min) {
            return min
        }
        if (value > max) {
            return max
        }
        return value
    }

    public translate(camX: number, camY: number, context: CanvasRenderingContext2D): void {
        context.translate(camX, camY)
    }

    // Elect and draw the correct tile from a tileset
    public electAndDrawTile(currentTile: any, context: CanvasRenderingContext2D, i: number, j: number): void {
        let tilesetToUse: Tileset
        for (let l = 0; l < this.tilesets.length; ++l) {
            if (this.tilesets[l].firstgid > currentTile && currentTile > 1) {
                tilesetToUse = this.tilesets[l - 1]
                tilesetToUse.drawTitle(currentTile - tilesetToUse.firstgid + l, context, i * Config.tileSize, j * Config.tileSize)
                return
            }
        }
        if (Config.tileSize == 16) {
            tilesetToUse = this.tilesets[this.tilesets.length - 1]
            tilesetToUse.drawTitle(currentTile - tilesetToUse.firstgid + this.tilesets.length, context, i * Config.tileSize, j * Config.tileSize)
        } else if (Config.tileSize == 32) {
            tilesetToUse = this.tilesets[this.tilesets.length - 1]
            tilesetToUse.drawTitle(currentTile - tilesetToUse.firstgid + this.tilesets.length - 1, context, i * Config.tileSize, j * Config.tileSize)
        }
    }

    // Detect if a position is an obstacle
    public isObstacle(positionToCheck: any): boolean {
        if (this.collisions.length > 0) {
            for (let i = 0; i < this.collisions.length; ++i) {
                let collWidth = this.collisions[i].width
                let collHeight = this.collisions[i].height
                let collX = this.collisions[i].x
                let collY = this.collisions[i].y

                let checkX = (positionToCheck.x * Config.tileSize) + Config.tileSize
                let checkY = (positionToCheck.y * Config.tileSize) + Config.tileSize

                // Compares the positionToCheck with the collision area
                if (checkX > collX && checkX < collX + collWidth && checkY > collY && checkY < collY + collHeight) {
                    return true
                }
            }
        }
        return false
    }

    public isNeighbor(direction: number, nextPos: { x: number, y: number }): string | undefined {
        for (let j = 0; j < this.neighbors.length; ++j) {
            if (this.neighbors[j].objects.length > 0) {
                for (let i = 0; i < this.neighbors[j].objects.length; ++i) {
                    let collWidth = this.neighbors[j].objects[i].width
                    let collHeight = this.neighbors[j].objects[i].height
                    let collX = this.neighbors[j].objects[i].x
                    let collY = this.neighbors[j].objects[i].y

                    let checkX = (nextPos.x * Config.tileSize) + Config.tileSize
                    let checkY = (nextPos.y * Config.tileSize) + Config.tileSize

                    // Compares the joueur's with the TP area
                    if (direction == Config.DIRECTION.UP) {
                        if (checkX > collX && checkX < collX + collWidth && checkY >= collY && checkY < collY + collHeight) {
                            return (this.neighbors[j].name.substr(3, this.neighbors[j].name.length))
                        }
                    } else if (direction == Config.DIRECTION.DOWN) {
                        if (checkX > collX && checkX < collX + collWidth && checkY - collHeight == collY + collHeight) {
                            return (this.neighbors[j].name.substr(3, this.neighbors[j].name.length))
                        }
                    } else if (direction == Config.DIRECTION.LEFT) {
                        if (checkX == collX && checkX < collX + collWidth && checkY >= collY && checkY < collY + collHeight) {
                            return (this.neighbors[j].name.substr(3, this.neighbors[j].name.length))
                        }
                    } else if (direction == Config.DIRECTION.RIGHT) {
                        if (checkX - collWidth == collX + collWidth && checkY >= collY && checkY < collY + collHeight) {
                            return (this.neighbors[j].name.substr(3, this.neighbors[j].name.length))
                        }
                    }
                }
            }
        }
        return undefined
    }
}