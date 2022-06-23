const _ = require('lodash')

export interface RGBVals {
    r: number
    g: number
    b: number
}
export type Vector3 = RGBVals

const d = (v: RGBVals, w: RGBVals): number => Math.abs(v.r - w.r) + Math.abs(v.g - w.g) + Math.abs(v.b - w.b)
const sub = (v: RGBVals, w: RGBVals, r?: number, g?: number, b?: number): RGBVals => ([r, g, b] = _.map(v, (val: number, key: keyof RGBVals) => val - w[key])) && { r, g, b }
const add = (v: RGBVals, w: RGBVals, r?: number, g?: number, b?: number): RGBVals => ([r, g, b] = _.map(v, (val: number, key: keyof RGBVals) => val + w[key])) && { r, g, b }
const getKey = (_: number, s: string) => (s == '0' ? 'r' : s == '1' ? 'g' : 'b') // [0, 1, 2] => [r, g, b]

const wageQuantum = (ind: number, max: number): number => 1 + Math.cos((ind * Math.PI * 2) / max + (4 * Math.PI) / 3) / 8

const splitQuantums = (left: number, right: number, k: number): number[] => {
    var [result, step]: [number[], number] = [[], (right - left) / (k - 1)]
    while (left < right) {
        result.push(Math.round(left))
        left += step
    }
    result.push(Math.round(right))
    return result
}

const findClosestQuantum = (value: number, quantums: number[]): number => {
    for (let i = 0; i < quantums.length - 1; i++) {
        const [down, up] = [quantums[i], quantums[i + 1]]
        if (down == value) return i
        else if (down < value && value < up) {
            let [down_diff, up_diff] = [value - down, up - value]
            if (down_diff < up_diff) return i
            else return i + 1
        }
    }
    return quantums.length - 1
}

const quantify = (data: Vector3[], quantums: number[]): Vector3[] => {
    let result: Vector3[] = []
    let [prev_diff, prev_value]: [Vector3, Vector3] = [
        { r: 0, g: 0, b: 0 },
        { r: 0, g: 0, b: 0 }
    ]

    let prev_wage = { r: 1, g: 1, b: 1 }
    for (const value of data) {
        let diff = sub(sub({ r: prev_wage.r * value.r, g: prev_wage.g * value.g, b: prev_wage.b * value.b }, prev_value), prev_diff)
        let quantum = { r: findClosestQuantum(diff.r, quantums), g: findClosestQuantum(diff.g, quantums), b: findClosestQuantum(diff.b, quantums) }
        result.push(quantum)
        prev_wage = { r: wageQuantum(quantum.r, quantums.length), g: wageQuantum(quantum.g, quantums.length), b: wageQuantum(quantum.b, quantums.length) }
        prev_diff = sub({ r: quantums[quantum.r], g: quantums[quantum.g], b: quantums[quantum.b] }, diff)
    }
    return result
}

const differentialCoding = (data: Vector3[], quantums: number[]): Vector3[] => {
    let result: Vector3[] = [data[0]]
    let quantized: Vector3[] = quantify(data, quantums)
    for (let i = 1; i < data.length; i++) result.push(sub(data[i], quantized[i - 1]))
    return result
}

const encode = (data: Vector3[], bits: number): number[] => {
    let quantums = splitQuantums(-255, 255, 2 ** bits)

    let [high, low]: [Vector3[], Vector3[]] = [[], []]
    for (let i = 1; i < data.length; i += 2) {
        high.push({ r: (data[i].r + data[i - 1].r) / 2, g: (data[i].g + data[i - 1].g) / 2, b: (data[i].b + data[i - 1].b) / 2 })
        low.push({ r: (data[i].r - data[i - 1].r) / 2, g: (data[i].g - data[i - 1].g) / 2, b: (data[i].b - data[i - 1].b) / 2 })
    }

    let result: Vector3[] = [...quantify(high, quantums), ...quantify(differentialCoding(low, quantums), quantums)] // QUANTIZATION !!
    let result_array: number[] = []
    for (const vec of result) result_array.push(vec.r, vec.g, vec.b)

    return result_array
}

const decode = (data: Vector3[], bits: number): Vector3[] => {
    let result: Vector3[] = []
    let quantums = splitQuantums(-255, 255, 2 ** bits)

    let cut = _.chunk(data, data.length / 2)
    let [high, low]: [Vector3[], Vector3[]] = [cut[0], cut[1]]

    // DEQUANTIZATION
    let [high_deq, low_deq]: [Vector3[], Vector3[]] = [[], []]
    for (const vec of high) high_deq.push({ r: quantums[vec.r], g: quantums[vec.g], b: quantums[vec.b] })

    let prev: Vector3 = { r: quantums[low[0].r], g: quantums[low[0].g], b: quantums[low[0].b] }
    low_deq.push(prev)
    for (let i = 1; i < low.length; i++) low_deq.push({ r: prev.r + quantums[low[i - 1].r], g: prev.g + quantums[low[i - 1].g], b: prev.b + quantums[low[i].b] })

    for (let i = 0; i < high_deq.length; i++) {
        result.push(sub(high_deq[i], low_deq[i]))
        result.push(add(high_deq[i], low_deq[i]))
    }

    return result
}

const printInfo = (result: Vector3[], data_vecs: Vector3[]) => {
    let mse_r = _.reduce(result, (sum: number, new_val: Vector3, vec: number) => sum + Math.pow(Math.abs(new_val.r - data_vecs[vec].r), 2), 0) / data_vecs.length
    let mse_g = _.reduce(result, (sum: number, new_val: Vector3, vec: number) => sum + Math.pow(Math.abs(new_val.g - data_vecs[vec].g), 2), 0) / data_vecs.length
    let mse_b = _.reduce(result, (sum: number, new_val: Vector3, vec: number) => sum + Math.pow(Math.abs(new_val.b - data_vecs[vec].b), 2), 0) / data_vecs.length
    let mse = _.reduce(result, (sum: number, new_val: Vector3, vec: number) => sum + Math.pow(d(new_val, data_vecs[vec]), 2), 0) / data_vecs.length
    let snr = _.reduce(result, (sum: number, new_val: Vector3, vec: number) => sum + Math.pow(result[vec].r + result[vec].g + result[vec].b, 2), 0) / data_vecs.length
    snr = 10 * Math.log10(snr / mse)

    console.log('> MSE: ', Math.sqrt(mse))
    console.log('> MSE(r): ', Math.sqrt(mse_r))
    console.log('> MSE(g): ', Math.sqrt(mse_g))
    console.log('> MSE(b): ', Math.sqrt(mse_b))
    console.log('> SNR: ', snr)
}

export const execute = (data: Uint8Array, mode: string, bits?: number, other?: Uint8Array): Uint8Array => {
    if (mode == 'encode') {
        console.log('Q: ', splitQuantums(-255, 255, 2 ** bits))
        console.log(splitQuantums(-255, 255, 2 ** bits).map((_, ind, arr) => wageQuantum(ind, arr.length)))

        // PARSING
        console.time('Parsing time')
        let data_vecs: Vector3[] = _.map(_.chunk(data, 4), (chunk: number[]) => _.mapKeys(_.dropRight(chunk), getKey))
        console.timeEnd('Parsing time')

        // CALCULATION
        console.time('Quantization time')
        let result = encode(data_vecs, bits)
        console.timeEnd('Quantization time')

        return new Uint8Array(result)
    } else if (mode == 'decode') {
        // PARSING
        console.time('Parsing time')
        let data_vecs: Vector3[] = _.map(_.chunk(data, 3), (chunk: number[]) => _.mapKeys(chunk, getKey))
        console.timeEnd('Parsing time')

        // CALCULATION
        console.time('Quantization time')
        let result = decode(data_vecs, bits)
        console.timeEnd('Quantization time')

        return new Uint8Array(_.flatten(_.map(result, (val: Vector3) => [...Object.values(val), 255])))
    } else if (mode == 'info') {
        console.time('Parsing time')
        let data_vecs: Vector3[] = _.map(_.chunk(data, 4), (chunk: number[]) => _.mapKeys(_.dropRight(chunk), getKey))
        let other_vecs: Vector3[] = _.map(_.chunk(other, 4), (chunk: number[]) => _.mapKeys(_.dropRight(chunk), getKey))
        console.timeEnd('Parsing time')
        printInfo(other_vecs, data_vecs)
    }
}
