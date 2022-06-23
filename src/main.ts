const { readFile } = require('fs/promises')
const myPrompt = require('prompt')
const TGA = require('tga')

import CONFIG from './config'
import { bufferFromBinString, writeToFile, writeToPng } from './utils'
import * as Quantization from './Quantization'

//
;(async () => {
    // SINGLE EXECUTION
    if (process.argv.slice(2).length > 0) {
        let [inputName, outputName, qBits] = process.argv.slice(2)
        let data = await readFile(inputName)
        const tga_img = new TGA(data)
        let processedData = Quantization.execute(tga_img.pixels, 'encode', Number(qBits)) // EXEC
        writeToFile('enc_' + outputName, bufferFromBinString(processedData.reduce((res, val) => res + val.toString(2).padStart(Number(qBits), '0'), '')))
        let decodedData = Quantization.execute(processedData, 'decode', Number(qBits)) // DECODE
        Quantization.execute(tga_img.pixels, 'info', null, decodedData) // COMPARE
        writeToPng('dec_' + outputName, decodedData, tga_img.width, tga_img.height)
        return
    }

    // TODO: PART BELOW SHOULD BE CORRECTED
    myPrompt.start()
    readingInput: while (true) {
        // INPUT
        var { inputName } = await myPrompt.get(CONFIG.IN_FILE_NAME_PROPERTIES)
        if (inputName === '') return

        let data: any
        try {
            data = await readFile(inputName)
        } catch (exc) {
            console.log(exc, 'File not found')
            continue readingInput
        }
        const tga_img = new TGA(data)

        let qBits_v = null
        let { mode } = await myPrompt.get(CONFIG.MODE_PROPERTIES)

        let other_img: any
        if (mode == 'info') {
            let { otherName } = await myPrompt.get(CONFIG.OTHER_FILE_NAME_PROPERTIES)
            let otherData: any
            try {
                data = await readFile(otherName)
            } catch (exc) {
                console.log(exc, 'File not found')
                continue readingInput
            }
            other_img = new TGA(otherData)
        } else {
            let { qBits } = await myPrompt.get(CONFIG.QBITS_PROPERTIES)
            qBits_v = qBits
        }

        // EXECUTION
        let processedData = Quantization.execute(tga_img.pixels, mode, qBits_v, other_img)
        if (processedData == null) continue readingInput

        // OUTPUT
        let { outputName } = await myPrompt.get(CONFIG.OUT_FILE_NAME_PROPERTIES)
        if (outputName !== '') writeToPng(outputName, processedData, tga_img.width, tga_img.height)
    }
})()
