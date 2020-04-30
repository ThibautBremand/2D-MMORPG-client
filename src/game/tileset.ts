import { Config } from '../config'

export class Tileset {
    image: any
    firstgid: any

    constructor(url: string, firstgid: any) {
        // Load the tileset into an Image
        this.image = new Image()
        this.firstgid = firstgid
        this.image.tilesetReference = this
        this.image.onload = function() {
            if (!this.complete) {
                throw new Error(`Error while loading the following tileset: ${ url }`)
            }

            // Largeur du tileset en tiles
            this.tilesetReference.largeur = this.width / Config.tileSize
        }
        this.image.src = `${ Config.tilesetURL }${ url }`
    }

    // Draw the title number 'nb' in the 2D Context 'context' with the coordinates below
    public drawTitle(nb: number, context: CanvasRenderingContext2D, xDestination: number, yDestination: number) {
        let xSourceEnTiles = nb % this.image.tilesetReference.largeur
        if (xSourceEnTiles === 0) xSourceEnTiles = this.image.tilesetReference.largeur
        const ySourceEnTiles = Math.ceil(nb / this.image.tilesetReference.largeur)

        const xSource = (xSourceEnTiles - 1) * Config.tileSize
        const ySource = (ySourceEnTiles - 1) * Config.tileSize

        context.drawImage(this.image, xSource, ySource, Config.tileSize, Config.tileSize, xDestination, yDestination, Config.tileSize, Config.tileSize)
    }
}