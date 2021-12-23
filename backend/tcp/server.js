const net = require("net")

const { logger } = require("../utils/logger")

const server = net.createServer()

server.on("connection", handleConnection)

const tcpLabel = { label: "tcp" }

function handleConnection (conn) {
    let remoteAddress = conn.remoteAddress + ":" + conn.remotePort
    logger.info(`new client connection from ${remoteAddress}`, tcpLabel)

    conn.on("data", onConnData)
    conn.once("close", onConnClose)
    conn.on("error", onConnError)

    let remainingLength = 0
    const buffers = []

    function onConnData (d) {
        if (remainingLength === 0) {
            const buffer = d.slice(0, 4)
            remainingLength = buffer.readUInt32BE()
            d = d.slice(4)
            logger.debug(`Expecting ${remainingLength} bytes from ${remoteAddress}`, { label: "tcp,exp" })
        }

        if (d.length === 0)
            return


        logger.debug(`Received ${d.length} bytes (${remainingLength - d.length} remaining) from ${remoteAddress}`,
            { label: "tcp,rec" })

        if (d.length < remainingLength) {
            buffers.push(d)
            remainingLength -= d.length
            return
        }

        buffers.push(d)
        let finalData = Buffer.concat(buffers)

        // TODO: Handle Final Data

        logger.debug(`Received final ${finalData.length} bytes (${buffers.length} packets) from ${remoteAddress}`,
            { label: "tcp,fin" })

        remainingLength = 0
        buffers.length = 0

    }

    function onConnClose () {
        logger.info(`Connection from ${remoteAddress} closed`, tcpLabel)
    }

    function onConnError (err) {
        logger.error(`Connection ${remoteAddress} error: ${err.message}`, tcpLabel)
    }
}

function startTCPServer () {
    server.listen(9000, function () {
        const { address, port } = server.address()
        logger.info(`Server listening on ${address}${port}`, tcpLabel)
    })
}

module.exports = { startTCPServer }