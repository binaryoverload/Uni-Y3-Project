const net = require("net")
const crypto = require("crypto")
const { Buffer } = require("buffer")
const readline = require("readline")

const ecdh = crypto.createECDH("prime256v1")
ecdh.generateKeys()

const serverPublicKey = Buffer.from("0396a991c70bbdfba9b116a59c107a5cbb769260c32b8db23372224004f02469a2", "hex")

function encryptData(data) {
    const sharedSecret = ecdh.computeSecret(serverPublicKey)
    const iv = crypto.randomBytes(16)
    const aesCipher = crypto.createCipheriv("aes-256-gcm", sharedSecret, iv)
    let encryptedData = aesCipher.update(data, "utf-8")
    encryptedData = Buffer.concat([encryptedData, aesCipher.final()])

    return Buffer.concat([iv, aesCipher.getAuthTag(), encryptedData])
}

function sendHello(client, data) {
    const clientPublicKey = ecdh.getPublicKey(null, "compressed")

    const opCode = Buffer.alloc(1)
    opCode.writeUInt8(1)

    const encryptedData = encryptData(data)
    const buf = Buffer.alloc(4)
    buf.writeUInt32BE(opCode.length + clientPublicKey.length + encryptedData.length)
    client.write(buf)
    client.write(opCode)
    client.write(clientPublicKey)
    client.write(encryptedData)
}

function sendData(client, data) {
    const opCode = Buffer.alloc(1)
    opCode.writeUInt8(3)

    const encryptedData = encryptData(data)
    const buf = Buffer.alloc(4)
    buf.writeUInt32BE(opCode.length + encryptedData.length)
    client.write(buf)
    client.write(opCode)
    client.write(encryptedData)
}

var client = new net.Socket()
client.connect(9000, "192.168.1.248", function () {
    console.log("Connected")

    let sentHello = false

    rl.on("line", () => {
        if (!sentHello) {
            sendHello(client, JSON.stringify({}))
            sentHello = true
            return
        }

        sendData(client, JSON.stringify({ rand: crypto.randomBytes(crypto.randomInt(1000)).toString("hex") }))
    })
})

client.on("data", function (data) {
    console.log("Received: " + data.toString("hex"))
    client.end()
})

client.on("close", function () {
    console.log("Connection closed")
})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})
