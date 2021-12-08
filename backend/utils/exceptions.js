const exceptionCodes = {
    notfound: "not_found",
    unauthorized: "unauthorized",
    invalidTokenType: "invalid_token_type",
    duplicate: "duplicate",
    jwtGeneral: "jwt_general",
    jwtExpired: "jwt_expired",
    validation: "validation"
}

class DuplicateEntityError extends Error {
    constructor (message) {
        super(message)
        this.name = "DuplicateEntityError"
    }
}

class HttpError extends Error {
    constructor (status, code, message) {
        super(`${status}: ${message}`)
        this.name = "HttpError"

        this.status = status
        this.code = code
    }
}

class UnauthorizedError extends HttpError {
    constructor (message = "Not logged in", code=exceptionCodes.unauthorized) {
        super(401, code, message)
    }
}

class NotFoundError extends HttpError {
    constructor (message = "Not found") {
        super(404, exceptionCodes.unauthorized, message)
    }
}

class DatabaseError extends Error {
    constructor (code, errName, message) {
        super(message)
        this.name = "DatabaseError"

        this.code = code
        this.errName = errName
    }
}

module.exports = { DuplicateEntityError, DatabaseError, HttpError, UnauthorizedError, NotFoundError, exceptionCodes }