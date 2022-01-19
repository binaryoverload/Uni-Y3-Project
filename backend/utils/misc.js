function splitHostAddress(hostAddress) {
    let colonIndex = hostAddress.lastIndexOf(":")
    const ip = hostAddress.substr(0, colonIndex)
    const port = hostAddress.substr(colonIndex + 1, hostAddress.length - colonIndex)

    return {
        ip,
        port
    }
}

module.exports = {
    splitHostAddress
}