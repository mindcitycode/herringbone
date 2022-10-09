import { fsCanvas } from './lib/fscanvas.js'
import { registerKeyboard } from './lib/keyboard.js'
import { rafLoop } from './lib/loop.js'
import { canvasMousePosition } from './lib/mouse.js'
import seedrandom from 'seedrandom'
import { clamp } from './lib/clamp.js'
import { loadImage } from './lib/image.js'
import { modulo } from './lib/modulo.js'

const keyboard = registerKeyboard()

const rng = seedrandom('hello.');
const rndInt = (min, max) => min + Math.floor((max - min) * rng())

const canvas = fsCanvas(window.innerWidth,window.innerHeight)
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

    const putRandomTile = (x, y, type, { real = true, outline = false } = {}) => {
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

    const putTile = (x, y, type, index) => {
        const rects = HerringboneTilesSources[(type === 0) ? 'vertical' : 'horizontal']
        const rect = rects[index]
        ctx.drawImage(image, ...rect, x, y, ...rect.slice(2, 4))
    }
    class Tile {
        constructor(x, y, type, index, props) {
            Object.assign(this, { x, y, type, index, props })
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
        tiles: {}
    }
    function getFromRowCol(c, r) {
        const i = c, j = r;
        const r4 = modulo(r, 4), c4 = modulo(c, 4);
        if (r4 === c4) {
            // top from vertical
            return { orientation: 'vertical', origin: { i, j }, which: 'up' }
        } else if (modulo(c + 1, 4) === r4) {
            // bottom from vertical
            return { orientation: 'vertical', origin: { i, j: j - 1 }, which: 'low' }
        } else if (c4 === modulo((r + 1), 4)) {
            // left from horizontal
            return { orientation: 'horizontal', origin: { i, j }, which: 'left' }
        } else if (c4 === modulo((r + 2), 4)) {
            // right from horisontal
            return { orientation: 'horizontal', origin: { i: i - 1, j }, which: 'right' }
        }
    }
    function getTile(i, j) {
        const props = getFromRowCol(i, j)
        const tileId = `${props.origin.i}_${props.origin.j}`
        const maybeTile = map.tiles[tileId]
        if (maybeTile) {
            return maybeTile
        } else {
            const rects = HerringboneTilesSources[props.orientation]
            //const rect = rects[Math.floor(rng() * rects.length)]
            const index = Math.floor(rng() * rects.length)
            const tile = new Tile(
                props.origin.i * 10, props.origin.j * 10,
                ((props.orientation === 'vertical') ? 0 : 1),
                index,
                props
            )
            map.tiles[tileId] = tile
            return tile
        }
    }

    const draw = (x, y) => {

        const xMin = Math.floor(x / 10) * 10
        const yMin = Math.floor(y / 10) * 10

        const nCols = Math.ceil(canvas.width / 10)
        const nRows = Math.ceil(canvas.height / 10)

        for (let r = 0; r <= nRows; r++) {
            for (let c = 0; c <= nCols; c++) {

                const px = x + c * 10
                const py = y + r * 10
                const ox = Math.floor(px / 10)
                const oy = Math.floor(py / 10)
                const tile = getTile(ox, oy)
                //              console.log('tile',tile)
                //if ((tile.props.which === 'left') || (tile.props.which === 'up')) {
                    putTile(-x + tile.x, -y + tile.y, tile.type, tile.index)
               // }
                if (false) {
                    const r4 = r % 4, c4 = c % 4;
                    if (c4 === r4) {
                        putRandomTile(c * short, r * short, 0)
                    } else if (((c + 1) % 4) === r4) {
                        if (r === 0) {
                            putRandomTile(c * short, (r - 1) * short, 0)
                        }
                    } else if (c4 === ((r + 1) % 4)) {
                        putRandomTile(c * short, r * short, 1)
                    } else if (c4 === ((r + 2) % 4)) {
                        if (c === 0) {
                            putRandomTile((c - 1) * short, r * short, 1)
                        }
                    }
                }
            }
        }
    }
    //draw()

    const origin = { x: 0, y: 0 }
    rafLoop((delta, time) => {
        const move = {
            x: keyboard.ArrowRight ? 1 : keyboard.ArrowLeft ? (-1) : 0,
            y: keyboard.ArrowDown ? 1 : keyboard.ArrowUp ? (-1) : 0,
        }
        origin.x += move.x
        origin.y += move.y
        //      origin.x = Math.max(0, origin.x)
        //    origin.y = Math.max(0, origin.y)
        clear()
        draw(origin.x, origin.y)
    })

}

go()