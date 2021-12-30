const { logger } = require("../utils/logger")
const config = require("../utils/config")
const { Hello, Data, HelloNAck, HelloAck, ErrorPacket } = require("./outerMessages")
const { computeSharedECHDSecret, decryptAes, ecPublicKey } = require("../utils/encryption")

class SessionHandler {

    #receivedHello = false
    #clientPublicKey = null
    #sharedSecret = null
    #clientId = null
    #hostAddress = null
    #invalidPacketCount = 0

    constructor (hostAddress) {
        this.#hostAddress = hostAddress
        logger.debug(`Started TCP session`, { label: "sess", host: hostAddress })
    }

    processOuterPacket(packet) {
        try {
            return this.#processOuterPacket(packet)
        } catch (e) {
            logger.error(`Error processing ${packet.constructor.name || "unknown"} packet: ${e.message}`, { label: "sess", host: this.#hostAddress })
        }
    }

    // Make a pass-through function to handle errors
    #processOuterPacket(packet) {
        if (packet instanceof Hello) {
            if (this.#receivedHello) {
                logger.error("Session has already been established with Hello!", { label: "sess", host: this.#hostAddress })
                return new HelloNAck()
            }
            this.#invalidPacketCount = 0
            this.#clientPublicKey = packet.senderPublicKey
            this.#sharedSecret = computeSharedECHDSecret(packet.senderPublicKey)
            const jsonData = this.#decryptJsonData(packet.aesData)
            console.log(jsonData)

            this.#receivedHello = true
            return new HelloAck(ecPublicKey, null)
        }
        if (packet instanceof Data) {
            if (!this.#receivedHello) {
                logger.error("Data packet received with no Hello", { label: "sess", host: this.#hostAddress })
                return new HelloNAck()
            }
            this.#invalidPacketCount = 0
            const jsonData = this.#decryptJsonData(packet.aesData)
            console.log(jsonData)
            return
        }

        const maxAllowedInvalid = 5

        this.#invalidPacketCount += 1
        if (this.#invalidPacketCount > maxAllowedInvalid) {
            logger.error(`Received ${maxAllowedInvalid} invalid packets, closing connection`, { label: "sess", host: this.#hostAddress })
            return new ErrorPacket()
        }
        logger.warn(`Received invalid packet of type ${packet.constructor.name || "unknown"}. Ignoring...`, { label: "sess", host: this.#hostAddress })
    }

    #decryptJsonData(aesData) {
        const decryptedData = decryptAes(this.#sharedSecret, aesData)
        let jsonData = null
        try {
            jsonData = JSON.parse(decryptedData)
        } catch (e) {
            throw new Error(`Could not parse JSON data: ${e.message}`)
        }
        return jsonData
    }

}

module.exports = SessionHandler