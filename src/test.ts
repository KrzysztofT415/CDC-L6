// const packer = () => {
//     const fn = (function* packer(v = 0): Generator<number, number, number> {
//         while (true) v += yield v
//     })()
//     fn.next()
//     return { place: (bits: number) => fn.next(bits).value }
// }

// let space = packer()
// console.log(space.place(7))
// console.log(space.place(3))
// console.log(space.place(4))

var fs = require('fs')
var TGA = require('tga')
const { readFile } = require('fs/promises')

;(async () => {
    let data = await readFile('./test/example0.tga')
    var tga = new TGA(data)
    console.log(tga.width, tga.height)
    for (var i = 0; i < tga.pixels.length; i += 4) {
        // the range of r, g, b and a is [0, 255]
        // console.log(tga.pixels[i], tga.pixels[i + 1], tga.pixels[i + 2], tga.pixels[i + 3])
    }
    console.log(tga)

    // save as another tga image
    var buf = TGA.createTgaBuffer(tga.width, tga.height, tga.pixels)
    fs.writeFileSync('./out/out.tga', buf)

    // save the tga as png
    var PNG = require('pngjs').PNG
    var png = new PNG({
        width: tga.width,
        height: tga.height
    })
    png.data = tga.pixels
    png.pack().pipe(fs.createWriteStream('./out/res.png'))
})()
