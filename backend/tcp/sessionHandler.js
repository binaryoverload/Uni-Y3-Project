const { logger } = require("../utils/logger")

const { Hello, Data, HelloNAck, HelloAck, ErrorPacket } = require("./outerMessages")
const { computeSharedECHDSecret, decryptAes, ecPublicKey, encryptAes } = require("../utils/encryption")
const { opCodeDecodeFunctions, encodeTCPError, opCodes: innerOpCodes } = require("./innerMessages")
const { CloseConnectionError } = require("../utils/tcpExceptions")
const { getClientByPublicKey } = require("../models/clients")

class SessionHandler {
    #receivedHello = false
    #clientPublicKey = null
    #sharedSecret = null
    #clientId = null
    #hostAddress = null
    #invalidPacketCount = 0

    constructor(hostAddress) {
        this.#hostAddress = hostAddress

        logger.debug("Started TCP session", { label: "sess", host: hostAddress.full })
    }

    async processOuterPacket(packet) {
        try {
            return await this.#processOuterPacket(packet)
        } catch (e) {
            logger.error(`Error processing ${packet.constructor.name || "unknown"} packet: ${e.message}`, {
                label: "sess",
                host: this.#hostAddress.full,
            })
        }
    }

    // Make a pass-through function to handle errors
    async #processOuterPacket(packet) {
        if (packet instanceof Hello) {
            if (this.#receivedHello) {
                logger.error("Session has already been established with Hello!", {
                    label: "sess",
                    host: this.#hostAddress.full,
                })
                return new HelloNAck()
            }
            this.#invalidPacketCount = 0
            this.#clientPublicKey = packet.senderPublicKey.toString("hex")
            this.#sharedSecret = computeSharedECHDSecret(packet.senderPublicKey)
            const jsonData = this.#decryptJsonData(packet.aesData)
            if (Object.keys(jsonData).length > 0) {
                logger.error("Received non-empty data from client on Hello", {
                    label: "sess",
                    host: this.#hostAddress.full,
                })
                return new HelloNAck()
            }

            const client = await getClientByPublicKey(this.#clientPublicKey)

            if (client) {
                this.#clientId = client.id
                logger.debug("Known client connected. Id: " + client.id, {
                    label: "sess",
                    host: this.#hostAddress.full,
                })
            } else {
                logger.debug("Unknown client connected", { label: "sess", host: this.#hostAddress.full })
            }

            this.#receivedHello = true
            return new HelloAck(ecPublicKey, encryptAes(this.#sharedSecret, {}))
        }
        if (packet instanceof Data) {
            if (!this.#receivedHello) {
                throw new CloseConnectionError("Data packet received with no Hello")
            }
            this.#invalidPacketCount = 0
            const jsonData = this.#decryptJsonData(packet.aesData)

            const decodeFunction = opCodeDecodeFunctions[jsonData.op_code]

            if (!decodeFunction) {
                logger.error(
                    `Decode function for op-code ${jsonData.op_code} does not exist. Op-code exists: ${Object.values(
                        innerOpCodes
                    ).includes(jsonData.op_code)}`,
                    { label: "sess", host: this.#hostAddress.full }
                )
                return new Data(
                    encryptAes(this.#sharedSecret, encodeTCPError(`Op-code ${jsonData.op_code} is not valid`))
                )
            }

            let result
            try {
                result = await decodeFunction(
                    {
                        hostAddress: this.#hostAddress,
                        clientId: this.#clientId,
                        clientPubKey: this.#clientPublicKey,
                    },
                    jsonData
                )
            } catch (e) {
                result = encodeTCPError(`${e.name}: ${e.message}`)
                logger.error(`Decoding failed. ${e.name}: ${e.message}`, {
                    stack: e.stack,
                    label: "sess",
                    host: this.#hostAddress.full,
                })
            }

            if (result) {
                return new Data(encryptAes(this.#sharedSecret, result))
            }

            return
        }

        const maxAllowedInvalid = 5

        this.#invalidPacketCount += 1
        if (this.#invalidPacketCount > maxAllowedInvalid) {
            logger.error(`Received ${maxAllowedInvalid} invalid packets, closing connection`, {
                label: "sess",
                host: this.#hostAddress.full,
            })
            return new ErrorPacket()
        }
        logger.warn(`Received invalid packet of type ${packet.constructor.name || "unknown"}. Ignoring...`, {
            label: "sess",
            host: this.#hostAddress.full,
        })
    }

    #decryptJsonData(aesData) {
        const decryptedData = decryptAes(this.#sharedSecret, aesData)
        let jsonData = null
        try {
            jsonData = { ...JSON.parse(decryptedData) }
        } catch (e) {
            throw new Error(`Could not parse JSON data: ${e.message}`)
        }
        return jsonData
    }
}

module.exports = SessionHandler
