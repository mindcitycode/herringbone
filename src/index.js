import { fsCanvas } from './lib/fscanvas.js'
import { registerKeyboard } from './lib/keyboard.js'
import { rafLoop } from './lib/loop.js'
import { canvasMousePosition } from './lib/mouse.js'
import seedrandom from 'seedrandom'
import { clamp } from './lib/clamp.js'
import { loadImage } from './lib/image.js'

const keyboard = registerKeyboard()

// rng
const rng = seedrandom('hello.');
const rndInt = (min, max) => min + Math.floor((max - min) * rng())

// image
const canvas = fsCanvas(200, 200)
const ctx = canvas.getContext('2d')

const sourceRect = ({ stride, tw, th, sx, sy, ox, oy }, n) => {
    const i = n % stride
    const j = Math.floor(n / stride)
    const x = ox + i * (tw + sx)
    const y = oy + j * (th + sy)
    return [x, y, tw, th]
}

const HerringboneTilesSources = {
    vertical: new Array(16 * 4).fill(0).map(
        (_, n) => sourceRect({ stride: 16, tw: 10, th: 20, sx: 2, sy: 4, ox: 1, oy: 2 }, n)
    ),
    horizontal: new Array(8 * 8).fill(0).map(
        (_, n) => sourceRect({ stride: 8, tw: 20, th: 10, sx: 4, sy: 2, ox: 2, oy: 97 }, n)
    )
}

const go = async () => {

    const image = await loadImage('/assets/chunks.png')
    console.log(HerringboneTilesSources)

    const tileSource0 = HerringboneTilesSources.vertical[0]
    ctx.drawImage(image, ...tileSource0, 0, 0, 10, 20)
    const tileSource1 = HerringboneTilesSources.vertical[17]
    ctx.drawImage(image, ...tileSource1, 10, 0, 10, 20)

    const tileSource2 = HerringboneTilesSources.horizontal[0]
    ctx.drawImage(image, ...tileSource2, 0, 40, 20, 10)
    const tileSource3 = HerringboneTilesSources.horizontal[8]
    ctx.drawImage(image, ...tileSource3, 0, 50, 20, 10)

    const putTile = (x, y, type) => {

        const w = (type === 0) ? 10 : 20
        const h = (type === 0) ? 20 : 10

        const rects = HerringboneTilesSources[(type === 0) ? 'vertical' : 'horizontal']
        const rect = rects[Math.floor(rng() * rects.length)]
        ctx.drawImage(image, ...rect, x, y, w, h)
       
        return 
        
        const alpha = 0.5
        const hue = rng()
        ctx.fillStyle = `hsla(${hue}turn, 40%, 40%, ${alpha})`
        ctx.fillRect(x, y, w, h)

        ctx.lineWidth = 1
        ctx.strokeStyle = `hsla(${hue}turn, 0%, 0%, ${1})`
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2)

    }


    let x = 0, y = 0
    for (let i = 0; i < (canvas.width / 10); i++) {
        putTile(x, y, 0)
        putTile(x + 10, y, 1)
        putTile(x + 30, y - 10, 0)
        x += 10
        y += 10
    }


    rafLoop((delta, time) => {

    })

}
go()
/*const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
const putPixel = (x, y, r, g, b, a) => {
    const offset = 4 * (x + canvas.width * y)
    imageData.data[offset] = r
    imageData.data[offset + 1] = g
    imageData.data[offset + 2] = b
    imageData.data[offset + 3] = a
}
const clear = () => {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}
*/