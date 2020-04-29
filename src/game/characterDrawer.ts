import { Config } from '../config'

export function generate(characterImage: HTMLImageElement, json: any): void {
    const newCanvas = document.createElement('canvas')
    const params = JSON.parse(json)
    redraw(characterImage, newCanvas, params)
}

// Called each time we redraw the canvas
function redraw(characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, params: any): void {
    // If an oversize element is being used, expand canvas,
    // otherwise return it to normal size
    let oversize = false
    if (oversize) {
        canvasChar.width = 1536
        canvasChar.height = 1344 + 768
    } else {
        canvasChar.width = 832
        canvasChar.height = 1344
    }

    const ctx = canvasChar.getContext('2d')
    if (!ctx) {
        throw new Error('can\'t get 2D context')
    }

    // Start over
    ctx.clearRect(0, 0, canvasChar.width, canvasChar.height)
    oversize = !!oversize

    // Determine if male or female selected
    let sex = 'male'
    if (params.sex === 'female') {
        sex = 'female'
    }

    drawBody(ctx, characterImage, canvasChar, sex, params)
}

function imgExtention(img: string): string {
    return img + '.png'
}

function drawBody(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    const skinColor = checkBody(params)
    const imgPath = imgExtention('body/' + sex + '/' + skinColor)
    getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawEars)
}

function drawEars(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    const skinColor = checkBody(params)
    if (params.ears) {
        const res = params.ears.split('_')
        const imgPath = imgExtention('body/' + sex + '/ears/' + res[0] + 'ears_' + skinColor)
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawEyes)
    } else {
        drawEyes(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawEyes(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.eyes) {
        const imgPath = imgExtention('body/' + sex + '/eyes/' + params.eyes)
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawNose)
    } else {
        drawNose(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawNose(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    const skinColor = checkBody(params)
    if (params.nose) {
        const res = params.nose.split('_')
        const imgPath = imgExtention('body/' + sex + '/nose/' + res[0] + 'nose_' + skinColor)
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawHair)
    } else {
        drawHair(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawHair(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.hair) {
        const res = params.hair.split('_')
        let imgPath = imgExtention('hair/' + sex + '/' + res[0] + '/' + res[1])
        if (res[2]) {
            imgPath = imgExtention('hair/' + sex + '/' + res[0] + '/' + res[1] + '-' + res[2])
        }
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawCape)
    } else {
        drawCape(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawCape(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.cape) {
        const res = params.cape.split('_')
        let imgPath = 'torso/back/cape/'
        switch(res[0]) {
            case 'tattered':
                imgPath += res[0] + '/' + sex + '/' + 'tattercape_' + res[1]
                imgPath = imgExtention(imgPath)
                break
            case 'trimmed':
                imgPath += res[0] + '/' + sex + '/' + 'trimcape_' + res[1]
                if (res[2]) {
                    imgPath += res[2]
                }
                imgPath = imgExtention(imgPath)
                break
            default:
                imgPath += 'normal/' + sex + '/' + 'cape_' + res[0]
                imgPath = imgExtention(imgPath)
        }
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawArmor)
    } else {
        drawArmor(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawArmor(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.armor) {
        const res = params.armor.split('_')
        switch(res[0]) {
            case 'chest':
                const imgPath = imgExtention('torso/' + res[1] + '/' + 'chest_' + sex)
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawJacket)
                break
            default:
                drawJacket(ctx, characterImage, canvasChar, sex, params)
        }
    } else {
        drawJacket(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawJacket(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.jacket) {
        const res = params.jacket.split('_')
        switch(res[0]) {
            case 'tabard':
                const imgPath = imgExtention('torso/chain/' + res[0] + '/' + 'jacket_' + sex)
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawTie)
                break
            default:
                drawTie(ctx, characterImage, canvasChar, sex, params)
        }
    } else {
        drawTie(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawTie(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.tie) {
        const res = params.tie.split('_')
        let imgPath = 'formal_' + sex + '_no_th-sh/'
        switch(res[0]) {
            case 'on':
                imgPath += 'tie'
                imgPath = imgExtention(imgPath)
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawArms)
                break
            case 'bow':
                imgPath += 'bowtie'
                imgPath = imgExtention(imgPath)
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawArms)
                break
            default:
                drawArms(ctx, characterImage, canvasChar, sex, params)
        }
    } else {
        drawArms(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawArms(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.arms) {
        const res = params.arms.split('_')
        const imgPath = imgExtention('torso/' + res[0] + '/' + 'arms_' + sex)
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawShoulders)
    } else {
        drawShoulders(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawShoulders(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.shoulders) {
        const res = params.shoulders.split('_')
        const imgPath = imgExtention('torso/' + res[0] + '/' + 'shoulders_' + sex)
        switch(res[0]) {
            case 'leather':
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawMail)
                break
            default:
                drawMail(ctx, characterImage, canvasChar, sex, params)
        }
    } else {
        drawMail(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawMail(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.mail) {
        const res = params.mail.split('_')
        const imgPath = imgExtention('torso/' + res[0] + '/' + 'mail_' + sex)
        switch(res[0]) {
            case 'chain':
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawGown)
                break
            default:
                drawGown(ctx, characterImage, canvasChar, sex, params)
        }
    } else {
        drawGown(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawGown(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.gown) {
        const res = params.mail.split('_')
        const imgPath = imgExtention('torso/dress_female/' + res[0])
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawClothes)
    } else {
        drawClothes(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawClothes(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.clothes) {
        const res = params.clothes.split('_')
        let imgPath = ''
        switch(res[0]) {
            // Clothes
            case 'dress':
                if (res[1] === 'sash') { // (dress_female)
                    imgPath = imgExtention('torso/dress_female/' + 'dress_w_' + res[1] + '_female')
                    getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawLegs)
                } else {
                    drawLegs(ctx, characterImage, canvasChar, sex, params)
                }
                break
            // Robe
            case 'robe':
                imgPath = 'torso/robes_' + sex + '_no_th-sh/' + res[1]
                if (res[2]) {
                    imgPath += ' ' + res[2]
                }
                imgPath = imgExtention(imgPath)
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawLegs)
                break
            // Shirts
            case 'pirate' || 'sleeveless':
                imgPath = imgExtention('torso/shirts/sleeveless/' + sex + '/' + res[1] + '_' + res[0])
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawLegs)
                break
            case 'longsleeve':
                imgPath = imgExtention('torso/shirts/longsleeve/' + sex + '/' + res[1] + '_' + res[0])
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawLegs)
                break
            // Tunics
            case 'tunic':
                imgPath = imgExtention('torso/tunics/' + sex + '/' + res[1] + '_' + res[0])
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawLegs)
                break
            default:
                drawLegs(ctx, characterImage, canvasChar, sex, params)
        }
    } else {
        drawLegs(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawLegs(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.legs) {
        const res = params.legs.split('_')
        let imgPath = ''
        switch(res[0]) {
            case 'pants':
                imgPath = imgExtention('legs/pants/' + sex + '/' + res[1] + '_' + res[0] + '_' + sex)
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawGreaves)
                break
            case 'robe':
                imgPath = imgExtention('legs/skirt/' + sex + '/' + res[0] + '_' + res[1] + '_' + sex + '_incomplete')
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawGreaves)
                break
            case 'sara':
                imgPath = imgExtention('legs/pants/' + sex + '/' + 'SaraLeggings')
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawGreaves)
                break
            default:
                drawGreaves(ctx, characterImage, canvasChar, sex, params)
        }
    } else {
        drawGreaves(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawGreaves(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.greaves) {
        const res = params.greaves.split('_')
        let imgPath = ''
        switch(res[0]) {
            case 'metal':
                imgPath = imgExtention('legs/armor/' + sex + '/' + res[0] + '_pants_' + sex)
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawFormal)
                break
            case 'golden':
                imgPath = imgExtention('legs/armor/' + sex + '/' + res[0] + '_greaves_' + sex)
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawFormal)
                break
            default:
                drawFormal(ctx, characterImage, canvasChar, sex, params)
        }
    } else {
        drawFormal(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawFormal(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.formal) {
        const res = params.legs.split('_')
        const imgPath = imgExtention('formal_' + sex + '_no_th-sh/' + res[0])
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawBracelet)
    } else {
        drawBracelet(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawBracelet(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.bracelet && params.bracelet === 'on') {
        const imgPath = imgExtention('hands/bracelets/bracelet')
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawBracers)
    } else {
        drawBracers(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawBracers(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.bracers) {
        const res = params.bracers.split('_')
        let imgPath = ''
        if (res[1] === 'cloth') {
            imgPath = imgExtention('hands/bracers/' + sex + '/' + res[0] + '_cloth_' + res[2])
        } else {
            imgPath = imgExtention('hands/bracers/' + sex + '/' + res[0] + '_bracers_' + sex)
        }
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawGloves)
    } else {
        drawGloves(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawGloves(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.gloves) {
        const res = params.gloves.split('_')
        const imgPath = imgExtention('hands/gloves/' + sex + '/' + res[0] + '_gloves_' + sex)
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawShoes)
    } else {
        drawShoes(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawShoes(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.shoes) {
        const res = params.shoes.split('_')
        let imgPath = ''
        switch(res[0]) {
            case 'ghillies':
                imgPath = imgExtention('feet/' + 'ghillies_' + sex + '_no_th-sh')
            case 'sara':
                imgPath = imgExtention('feet/shoes/' + sex + '/SaraShoes')
            case 'boots':
                imgPath = imgExtention('feet/armor/' + sex + '/' + res[1] + '_boots_' + sex)
            case 'slippers':
                imgPath = imgExtention('feet/slippers_' + sex + '/' + res[1])
            default:
                imgPath = imgExtention('feet/shoes/' + sex + '/' + res[0] + '_shoes_' + sex)
        }
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawBelt)
    } else {
        drawBelt(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawBelt(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.belt) {
        const res = params.belt.split('_')
        let imgPath = ''
        if (res[0] === 'leather') {
            imgPath = imgExtention('belt/' + res[0] + '/' + sex + '/' + 'leather_' + sex)
        } else if (res[0] === 'cloth') {
            if (res[1] === 'teal' && sex === 'female') {
                imgPath = imgExtention('belt/cloth/' + sex + '/' + 'teal2_cloth_' + sex)
            } else {
                imgPath = imgExtention('belt/' + res[0] + '/' + sex + '/' + res[1] + '_' + res[0] + '_' + sex)
            }
        } else {
            imgPath = imgExtention('belt/metal/' + sex + '/' + res[0] + '_' + sex + '_no_th-sh')
        }
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawBuckle)
    } else {
        drawBuckle(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawBuckle(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.buckle) {
        const res = params.buckle.split('_')
        const imgPath = imgExtention('belt/buckles_' + sex + '_no_th-sh/' + res[0])
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawNecklace)
    }
    else {
        drawNecklace(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawNecklace(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.necklace) {
        const res = params.necklace.split('_')
        const imgPath = imgExtention('accessories/necklaces_' + sex + '_ no_th-sh/' + res[0])
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawCapeacc)
    } else {
        drawCapeacc(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawCapeacc(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.capeacc) {
        const res = params.capeacc.split('_')
        const imgPath = imgExtention('accessories/neck/cape' + res[0] + '/' + sex + '/' + 'cape' + res[0] + '_' + res[1])
        getImage(ctx, imgPath, characterImage, canvasChar, sex, params, drawHat)
    } else {
        drawHat(ctx, characterImage, canvasChar, sex, params)
    }
}

function drawHat(ctx: CanvasRenderingContext2D, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any) {
    if (params.hat) {
        const res = params.hat.split('_')
        let imgPath = ''
        switch(res[0]) {
            case 'bandana':
                imgPath = imgExtention('head/' + res[0] + 's/' + sex + '/' + res[1])
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, noop )
            case 'cap':
                imgPath = imgExtention('head/' + res[0] + 's/' + sex + '/' + res[1] + '_cap_' + sex)
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, noop )
            case 'chain':
                imgPath = imgExtention('head/helms/' + sex + '/' + 'chainhat_' + sex)
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, noop )
            case 'hood':
                imgPath = imgExtention('head/' + res[0] + 's/' + sex + '/' + res[1] + '_hood_' + sex)
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, noop )
            case 'helmet':
                imgPath = imgExtention('head/helms/' + sex + '/' + res[1] + '_helm_' + sex)
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, noop )
            case 'tiara':
                imgPath = imgExtention('head/tiaras_' + sex + '/' + res[1])
                getImage(ctx, imgPath, characterImage, canvasChar, sex, params, noop )
            default:
                noop ()
        }
    } else {
        noop ()
    }
}

function checkBody(params: any): string {
    if (!(params.body)) {
        return 'light'
    }
    return params.body as string
}

function noop () {}

// Called each time we want to draw a part of a character
function getImage(ctx: CanvasRenderingContext2D, imgRef: string, characterImage: HTMLImageElement, canvasChar: HTMLCanvasElement, sex: string, params: any, callback: any) {
    const img = new Image()
    loadImage(Config.spritesURL + imgRef, img)
        .then(img => {
            drawImage(ctx, img)
            characterImage.src = canvasChar.toDataURL('image/png')
            callback(ctx, characterImage, canvasChar, sex, params)
        })
        .catch(error => {
            console.error(error)
            callback(ctx, characterImage, canvasChar, sex, params)
        })
}

// Load an image from the storage
function loadImage(url: string, img: any): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
        img.addEventListener('load', () => resolve(img))
        img.addEventListener('error', () => {
            reject(new Error(`Failed to load image's URL: ${url}`))
        })
        img.src = url
    })
}

// draw the image in the client's context
function drawImage(ctx: CanvasRenderingContext2D, img: any) {
    try {
        ctx.drawImage(img, 0, 0)
    } catch(err) {
        console.error('Error: could not find ' + img.src)
    }
}
