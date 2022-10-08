import { fsCanvas } from './lib/fscanvas.js'
import { registerKeyboard } from './lib/keyboard.js'
import { rafLoop } from './lib/loop.js'
import { canvasMousePosition } from './lib/mouse.js'
import seedrandom from 'seedrandom'
import { clamp } from './lib/clamp.js'
import { loadImage } from './lib/image.js'

// rng
const rng = seedrandom('hello.');
const rndInt = (min, max) => min + Math.floor((max - min) * rng())

// image
const canvas = fsCanvas(200, 200)
const ctx = canvas.getContext('2d')

const HerringboneTilesSources = {
    vertical: new Array(16 * 4).fill(0).map((_, n) => {
        const stride = 16
        const tw = 10
        const th = 20
        const sx = 2
        const sy = 4
        const ox = 1
        const oy = 2
        const i = n % stride
        const j = Math.floor(n / stride)
        const x = ox + i * (tw + sx)
        const y = oy + j * (th + sy)
        return [x, y, tw, th]
    }),
    horizontal: new Array(8 * 8).fill(0).map((_, n) => {
        const stride = 8
        const tw = 20
        const th = 10
        const sx = 4
        const sy = 2
        const ox = 2
        const oy = 97
        const i = n % stride
        const j = Math.floor(n / stride)
        const x = ox + i * (tw + sx)
        const y = oy + j * (th + sy)
        return [x, y, tw, th]
    }),

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