const fs = require('fs')
var PNG = require('pngjs').PNG

export const getEntropy = (data: Buffer | number[]): number => {
    let entropy = 0
    const counts = Array(256).fill(0)
    for (const symbol of data) counts[symbol]++
    for (const count of counts) {
        let freq = count / data.length
        if (freq) entropy -= freq * Math.log2(freq)
    }
    return entropy
}

export const bufferFromBinString = (binStr: string, bytes = binStr.match(/[01]{8}|[01]+/g)): Buffer => Buffer.from(new Uint8Array([...bytes.map(val => parseInt(val.padEnd(8, '0'), 2)), bytes[bytes.length - 1].length]).buffer)
export const binStringFromBuffer = (data: Buffer, cut = data[data.length - 1]): string => data.reduce((res, val) => res + val.toString(2).padStart(8, '0'), '').slice(0, (data.length - 2) * 8 + cut)

export const writeToFile = (outputName: string, processedData: Buffer) => {
    fs.mkdir('./out', (err: any) => {
        if (err && err.errno != -17) {
            console.log(err, 'Output path corrupted')
            return
        }

        fs.writeFile('./out/' + outputName + '.txt', processedData, { encoding: 'utf8', flag: 'w' }, (err: any) => {
            if (err) console.log(err, 'Output file corrupted')
        })
    })
}

export const writeToPng = (outputName: string, processedData: Uint8Array, width: number, height: number) => {
    fs.mkdir('./out', (err: any) => {
        if (err && err.errno != -17) {
            console.log(err, 'Output path corrupted')
            return
        }

        var png = new PNG({ width, height })
        png.data = processedData
        png.pack().pipe(fs.createWriteStream('./out/' + outputName + '.png'))
    })
}
