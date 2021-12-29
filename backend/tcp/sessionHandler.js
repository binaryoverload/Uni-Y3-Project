const { logger } = require("../utils/logger")
const { Hello } = require("./outerMessages")
const { computeSharedECHDSecret } = require("../utils/encryption")

class SessionHandler {

    #receivedHello = false
    #clientPublicKey = null
    #sharedSecret = null
    #clientId = null
    #hostAddress = null

    constructor (hostAddress) {
        this.#hostAddress = hostAddress
        logger.debug(`Started TCP session`, { label: "sess", host: hostAddress })
    }

    processPacket(packet) {
        try {
            this._processPacket(packet)
        } catch (e) {
            logger.error(`Error processing ${packet.constructor.name || "unknown"} packet: ${e.message}`, { label: "sess", host: this.#hostAddress })
        }
    }

    // Make a pass-through function to handle errors
    _processPacket(packet) {
        if (packet instanceof Hello) {
            if (this.#receivedHello) throw new Error("Session has already been established with Hello!")
            this.#clientPublicKey = packet.senderPublicKey
            this.#sharedSecret = computeSharedECHDSecret(packet.senderPublicKey)
            this.#receivedHello = true
        }
    }

}

module.exports = SessionHandler