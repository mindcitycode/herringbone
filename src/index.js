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

const canvas = fsCanvas(128, 128)
const ctx = canvas.getContext('2d')
const clear = () => {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}
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
        if (real) {
            const rects = HerringboneTilesSources[(type === 0) ? 'vertical' : 'horizontal']
            const rect = rects[Math.floor(rng() * rects.length)]
            ctx.drawImage(image, ...rect, x, y, ...rect.slice(2, 4))
        }
        if (outline) {
            const w = (type === 0) ? short : long
            const h = (type === 0) ? long : short
            const alpha = 0.75
            const s = 30 + rng() * 20
            const l = 30 + rng() * 20
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
        rows: 9,
        columns: 9,
        tiles: []
    }

    function getFromRowCol(i, j) {
        const r4 = r % 4, c4 = c % 4;
        if (r4 === c4) {
            // top from vertical
            return ['vertical', i, j, 'up']
        } else if (((c + 1) % 4) === ((r) % 4)) {
            // bottom from vertical
            return ['vertical', i, j - 1, 'low']
        } else if (((c) % 4) === ((r + 1) % 4)) {
            // left from horizontal
            return ['horizontal', i, j, 'left']
        } else if (((c) % 4) === ((r + 2) % 4)) {
            // right from horisontal
            return ['horizontal', i - 1, j, 'right']
        }
    }

    const draw = () => {
        for (let r = 0; r < map.rows; r++) {
            for (let c = 0; c < map.columns; c++) {
                if ((c % 4) === (r % 4)) {
                    putRandomTile(c * short, r * short, 0)
                } else if (((c + 1) % 4) === (r % 4)) {
                    if (r === 0) {
                        putRandomTile(c * short, (r - 1) * short, 0)
                    }
                } else if ((c % 4) === ((r + 1) % 4)) {
                    putRandomTile(c * short, r * short, 1)
                } else if ((c % 4) === ((r + 2) % 4)) {
                    if (c === 0) {
                        putRandomTile((c - 1) * short, r * short, 1)
                    }
                }

            }
        }
    }
    draw()

    if (false)
        rafLoop((delta, time) => {
            clear()
            draw()
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