import { Config } from "./config/config.js"

export class Tileset {
    image: any
    firstgid: any

    constructor(url: string, firstgid: any) {
        // Load the tileset into an Image
        this.image = new Image()
        this.firstgid = firstgid
        this.image.tilesetReference = this
        this.image.onload = function() {
            if(!this.complete) {
                throw new Error("Erreur de chargement du tileset nommé \"" + url + "\".");
            }
    
            // Largeur du tileset en tiles
            this.tilesetReference.largeur = this.width / Config.tileSize;
        }
        this.image.src = "front/tilesets/" + url;
    }

    // Draw the title number 'nb' in the 2D Context 'context' with the coordinates below
    public drawTitle(nb: number, context: CanvasRenderingContext2D, xDestination: number, yDestination: number) {
        var xSourceEnTiles = nb % this.image.tilesetReference.largeur;
        if(xSourceEnTiles == 0) xSourceEnTiles = this.image.tilesetReference.largeur;
        var ySourceEnTiles = Math.ceil(nb / this.image.tilesetReference.largeur);

        var xSource = (xSourceEnTiles - 1) * Config.tileSize;
        var ySource = (ySourceEnTiles - 1) * Config.tileSize;

        context.drawImage(this.image, xSource, ySource, Config.tileSize, Config.tileSize, xDestination, yDestination, Config.tileSize, Config.tileSize);
    }
}