export default class CONFIG {
    static IN_FILE_NAME_PROPERTIES = [
        {
            name: 'inputName',
            description: 'Enter input file name',
            type: 'string'
        }
    ]
    static OUT_FILE_NAME_PROPERTIES = [
        {
            name: 'outputName',
            description: 'Enter output file name',
            type: 'string'
        }
    ]
    static OTHER_FILE_NAME_PROPERTIES = [
        {
            name: 'otherName',
            description: 'Enter file name to compare',
            type: 'string'
        }
    ]

    static QBITS_PROPERTIES = [
        {
            name: 'qBits',
            description: 'Enter number of bits for quantizator {1,...,7}',
            type: 'number'
        }
    ]
    static MODE_PROPERTIES = [
        {
            name: 'mode',
            description: 'Enter mode',
            validator: /^((encode)|(decode)|(info))$/,
            warning: 'Must be either info, encode or decode',
            required: true
        }
    ]
}
