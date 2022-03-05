class TcpError extends Error {
    constructor(message) {
        super(message)
    }
}

class CloseConnectionError extends TcpError {
    constructor(message = "Connection closed by server") {
        super(message)
    }
}

module.exports = {
    TcpError,
    CloseConnectionError,
}
