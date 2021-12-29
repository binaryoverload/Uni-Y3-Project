const net = require("net")

const { logger } = require("../utils/logger")
const { opCodeMapping } = require("./outerMessages")
const SessionHandler = require("./sessionHandler")

const server = net.createServer()

server.on("connection", handleConnection)

const tcpLabel = { label: "tcp" }

function handleError (fun) {
    return (param) => {
        try {
            fun(param)
        } catch (e) {
            console.error(e)
        }
    }
}

function processFinalData (finalData, address) {
    const outerOpCode = finalData.readUInt8(0)
    const dataModel = opCodeMapping[outerOpCode]
    logger.debug(`Received message with op-code ${outerOpCode} (${dataModel?.name || "Unknown"})`, { label: "tcp,fin", host: address })

    if (!dataModel) {
        logger.debug(`Unknown op-code, dropping packet`, { label: "tcp,err", host: address })
        return
    }

    return dataModel.decode(finalData)
}

function handleConnection (conn) {
    let remoteAddress = conn.remoteAddress + ":" + conn.remotePort
    logger.info(`new client connection`, { ...tcpLabel, host: remoteAddress })

    const sessionHandler = new SessionHandler(remoteAddress)

    conn.on("data", handleError(onConnData))
    conn.once("close", onConnClose)
    conn.on("error", onConnError)

    let remainingLength = 0
    const buffers = []

    function onConnData (d) {
        if (remainingLength === 0) {
            const buffer = d.slice(0, 4)
            remainingLength = buffer.readUInt32BE()
            if (remainingLength === 0) {
                logger.debug(`Received a 0-length packet`, { label: "tcp,err", host: remoteAddress })
                return
            }
            d = d.slice(4)
            logger.debug(`Expecting ${remainingLength} bytes`, { label: "tcp,exp", host: remoteAddress  })
        }

        if (d.length === 0)
            return

        logger.debug(`Received ${d.length} bytes (${remainingLength - d.length} remaining)`,
            { label: "tcp,rec", host: remoteAddress  })

        if (d.length < remainingLength) {
            buffers.push(d)
            remainingLength -= d.length
            return
        }

        if (d.length > remainingLength) {
            logger.debug(`Received ${d.length - remainingLength} too many bytes. Dropping packet`, { label: "tcp,err", host: remoteAddress  })
            return
        }

        buffers.push(d)
        let finalData = Buffer.concat(buffers)

        try {
            logger.debug(`Received final ${finalData.length} bytes (${buffers.length} packets)`,
                { label: "tcp,fin", host: remoteAddress  })
            const data = processFinalData(finalData, remoteAddress)
            sessionHandler.processPacket(data)
        } catch (e) {
            logger.error(`Error processing final data: ${e.message}`, { label: "tcp,err", host: remoteAddress   })
        } finally {
            remainingLength = 0
            buffers.length = 0
        }
    }

    function onConnClose () {
        logger.info(`Connection closed`, { ...tcpLabel, host: remoteAddress  })
    }

    function onConnError (err) {
        logger.error(`Connection error: ${err.message}`, { ...tcpLabel, host: remoteAddress  })
    }
}

function startTCPServer () {
    server.listen(9000, function () {
        const { address, port } = server.address()
        logger.info(`Server listening on ${address}${port}`, tcpLabel)
    })
}

module.exports = { startTCPServer }