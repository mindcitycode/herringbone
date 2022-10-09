import { fsCanvas } from './lib/fscanvas.js'
import { registerKeyboard } from './lib/keyboard.js'
import { rafLoop } from './lib/loop.js'
import { canvasMousePosition } from './lib/mouse.js'
import seedrandom from 'seedrandom'
import { clamp } from './lib/clamp.js'
import { loadImage } from './lib/image.js'

const keyboard = registerKeyboard()

const rng = seedrandom('hello.');
const rndInt = (min, max) => min + Math.floor((max - min) * rng())

const canvas = fsCanvas(132, 155)
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
    const short = 10, long = 20;

    const putRandomTile = (x, y, type, real = true, outline = false) => {

        const w = (type === 0) ? short : long
        const h = (type === 0) ? long : short

        if (real) {
            const rects = HerringboneTilesSources[(type === 0) ? 'vertical' : 'horizontal']
            const rect = rects[Math.floor(rng() * rects.length)]
            ctx.drawImage(image, ...rect, x, y, w, h)
        }
        if (outline) {
            const alpha = 0.75
            const s = 30 + rng() * 40
            const l = 30 + rng() * 70
            const hue = rng()
            ctx.fillStyle = `hsla(${hue}turn, ${s}%, ${l}%, ${alpha})`
            ctx.fillRect(x, y, w, h)
        }
    }

    class Tile {
        constructor(x, y, type, index) {
            Object.assign(this, { x, y, type, index })
        }
        getRect() {
            const w = (type === 0) ? short : long
            const h = (type === 0) ? long : short
            return [x, y, w, h]
        }
    }

    const map = {
        rows: 20,
        columns: 20,
        tiles: []
    }
    for (let r = 0; r < map.rows; r++) {
        for (let c = 0; c < map.columns; c++) {
            const r4 = r % 4, c4 = c % 4;
            if ((c4 === 0) && (r4 === 0)) {
                putRandomTile(c * short, r * short, 0)
            } else if ((c4 === 1) && (r4 === 0)) {
                putRandomTile(c * short, r * short, 1)
            } else if ((c4 === 3) && (r4 === 0)) {
                putRandomTile(c * short, (r-1) * short, 0)
            } else if ((c4 === 0) && (r4 === 2)) {
                putRandomTile((c-1) * short, r * short, 1)
            } else if ((c4 === 0) && (r4 === 3)) {
                putRandomTile(c * short, r * short, 1)
            } else if ((c4 === 1) && (r4 === 1)) {
                putRandomTile(c * short, r * short, 0)
            } else if ((c4 === 2) && (r4 === 1)) {
                putRandomTile(c * short, r * short, 1)
            } else if ((c4 === 2) && (r4 === 2)) {
                putRandomTile(c * short, r * short, 0)
            } 
        }
    }



    function non() {
        let x = 0, y = 0
        //for (let i = 0; i < 1 ; i++)
        for (let i = 0; i < (canvas.width / short); i++) {
            putRandomTile(x, y, 0)
            //        putRandomTile(x + short, y, 1)
            putRandomTile(x + 30, y - short, 0)

            // width loop
            putRandomTile(x + 40, y, 0)

            putRandomTile(x - short, y + long, 1)

            //      putRandomTile(x, y + 30, 1)
            // height loop
            putRandomTile(x, y + 40, 0)


            x += short
            y += short

        }
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