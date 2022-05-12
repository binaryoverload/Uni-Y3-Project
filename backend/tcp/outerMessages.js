const opCodes = {
    HELLO: 1,
    HELLOACK: 2,
    HELLONACK: 3,
    DATA: 4,
    ERROR: 5,
}

class AesData {
    constructor(iv, tag, data) {
        this.iv = iv
        this.tag = tag
        this.data = data
    }

    static decode(buffer) {
        if (!(buffer instanceof Buffer)) throw new Error("Decode param must be buffer")
        if (buffer.length <= 32)
            throw new Error("AES Data must contain IV (16 bytes), tag (16 bytes) and data (1+ bytes)")
        return new AesData(buffer.slice(0, 16), buffer.slice(buffer.length - 16), buffer.slice(16, buffer.length - 16))
    }

    encode() {
        const buffer = Buffer.alloc(32 + this.data.length)
        this.iv.copy(buffer, 0)
        this.data.copy(buffer, 16)
        this.tag.copy(buffer, 16 + this.data.length)
        return buffer
    }
}

class OuterMessage {
    constructor(opCode) {
        this.opCode = opCode
    }

    static decode() {
        throw new Error(`Decode is not defined for ${this.name}`)
    }

    encode() {
        throw new Error(`Encode is not defined for ${this.constructor.name}`)
    }
}

class Hello extends OuterMessage {
    constructor(senderPublicKey, aesData) {
        super(opCodes.HELLO)
        this.senderPublicKey = senderPublicKey
        this.aesData = aesData
    }

    static decode(buffer) {
        if (!(buffer instanceof Buffer)) throw new Error("Decode param must be buffer")
        if (buffer.length <= 1 + 33 + 32)
            throw new Error("Hello must contain opcode (1 byte) + public key (33 bytes) + AES data (32+ bytes)")
        if (buffer.readUInt8() !== opCodes.HELLO)
            throw new Error(`OP Code does not match. Expected ${opCodes.HELLO}, got ${buffer.readUInt8()}`)
        if (buffer.readUInt8(1) !== 0x03 && buffer.readUInt8(1) !== 0x02)
            throw new Error("Public key must be in compressed format. First byte is not 0x03 or 0x02")
        return new Hello(buffer.slice(1, 34), AesData.decode(buffer.slice(34)))
    }

    encode() {
        const aesData = this.aesData.encode()
        const buffer = Buffer.alloc(1 + 33 + aesData.length)
        buffer.writeUInt8(this.opCode)
        this.senderPublicKey.copy(buffer, 1, 0, 33)
        aesData.copy(buffer, 34, 0)
        return buffer
    }
}

class HelloAck extends OuterMessage {
    constructor(senderPublicKey, aesData) {
        super(opCodes.HELLOACK)
        this.senderPublicKey = senderPublicKey
        this.aesData = aesData
    }

    static decode(buffer) {
        if (!(buffer instanceof Buffer)) throw new Error("Decode param must be buffer")
        if (buffer.length <= 1 + 33 + 32)
            throw new Error("HelloAck must contain opcode (1 byte) + public key (33 bytes) + AES data (32+ bytes)")
        if (buffer.readUInt8() !== opCodes.HELLOACK)
            throw new Error(`OP Code does not match. Expected ${opCodes.HELLOACK}, got ${buffer.readUInt8()}`)
        if (buffer.readUInt8(1) !== 0x03 && buffer.readUInt8(1) !== 0x02)
            throw new Error("Public key must be in compressed format. First byte is not 0x03 or 0x02")
        return new HelloAck(buffer.slice(1, 34), AesData.decode(buffer.slice(34)))
    }

    encode() {
        const aesData = this.aesData.encode()
        const buffer = Buffer.alloc(1 + 33 + aesData.length)
        buffer.writeUInt8(this.opCode)
        this.senderPublicKey.copy(buffer, 1, 0, 33)
        aesData.copy(buffer, 34, 0)
        return buffer
    }
}

class HelloNAck extends OuterMessage {
    constructor() {
        super(opCodes.HELLONACK)
    }

    static decode(buffer) {
        if (!(buffer instanceof Buffer)) throw new Error("Decode param must be buffer")
        if (buffer.length < 1) throw new Error("HelloNAck must contain the OpCode (1 byte)")
        if (buffer.readUInt8() !== opCodes.HELLONACK)
            throw new Error(`OP Code does not match. Expected ${opCodes.HELLONACK}, got ${buffer.readUInt8()}`)
        return new HelloNAck()
    }

    encode() {
        return Buffer.from([opCodes.HELLONACK])
    }
}

class Data extends OuterMessage {
    constructor(aesData) {
        super(opCodes.DATA)
        this.aesData = aesData
    }

    static decode(buffer) {
        if (!(buffer instanceof Buffer)) throw new Error("Decode param must be buffer")
        if (buffer.length <= 1 + 32) throw new Error("HelloAck must contain opcode (1 byte) + AES data (32+ bytes)")
        if (buffer.readUInt8() !== opCodes.DATA)
            throw new Error(`OP Code does not match. Expected ${opCodes.DATA}, got ${buffer.readUInt8()}`)
        return new Data(AesData.decode(buffer.slice(1)))
    }

    encode() {
        const aesData = this.aesData.encode()
        const buffer = Buffer.alloc(1 + aesData.length)
        buffer.writeUInt8(this.opCode)
        aesData.copy(buffer, 1)
        return buffer
    }
}

class ErrorPacket extends OuterMessage {
    constructor() {
        super(opCodes.ERROR)
    }

    static decode(buffer) {
        if (!(buffer instanceof Buffer)) throw new Error("Decode param must be buffer")
        if (buffer.length < 1) throw new Error("Error must contain the OpCode (1 byte)")
        if (buffer.readUInt8() !== opCodes.HELLONACK)
            throw new Error(`OP Code does not match. Expected ${opCodes.ERROR}, got ${buffer.readUInt8()}`)
        return new ErrorPacket()
    }

    encode() {
        return Buffer.from([opCodes.ERROR])
    }
}

const opCodeMapping = {
    [opCodes.HELLO]: Hello,
    [opCodes.HELLOACK]: HelloAck,
    [opCodes.HELLONACK]: HelloNAck,
    [opCodes.DATA]: Data,
    [opCodes.ERROR]: ErrorPacket,
}

module.exports = { opCodes, opCodeMapping, AesData, OuterMessage, Hello, HelloAck, HelloNAck, Data, ErrorPacket }
