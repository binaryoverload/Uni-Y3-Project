const crypto = require("crypto")

const config = require("./config")
const { AesData } = require("../tcp/outerMessages")
const { logger } = require("./logger")

const ecdh = crypto.createECDH(config.encryption.ecCurve)
ecdh.setPrivateKey(config.encryption.ecPrivateKey, "hex")

logger.info(`ECDH Public Key: ${ecdh.getPublicKey("hex", "compressed")}`)

function computeSharedECHDSecret(senderPublicKey) {
    if (Buffer.isBuffer(senderPublicKey)) {
        return ecdh.computeSecret(senderPublicKey)
    }
    return ecdh.computeSecret(senderPublicKey, "hex")
}

function encryptAes(secret, data) {
    const iv = crypto.randomBytes(16)
    const aesCipher = crypto.createCipheriv(config.encryption.aesAlgorithm, secret, iv)
    if (!(data instanceof String) || !Buffer.isBuffer(data)) {
        data = JSON.stringify(data)
    }
    let encryptedData = aesCipher.update(data)
    encryptedData = Buffer.concat([encryptedData, aesCipher.final()])
    return new AesData(iv, aesCipher.getAuthTag(), encryptedData)
}

function decryptAes(secret, aesData) {
    if (!(aesData instanceof AesData)) {
        throw new Error("aesData must be a AesData class instance")
    }
    const { iv, tag, data } = aesData

    const aesDecipher = crypto.createDecipheriv(config.encryption.aesAlgorithm, secret, iv)
    aesDecipher.setAuthTag(tag)

    let decryptedData = aesDecipher.update(data)
    decryptedData = Buffer.concat([decryptedData, aesDecipher.final()])

    return decryptedData
}


module.exports = {
    computeSharedECHDSecret,
    encryptAes,
    decryptAes,
    ecPublicKey: ecdh.getPublicKey(null, "compressed")
}