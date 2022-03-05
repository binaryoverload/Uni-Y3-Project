const exceptionCodes = {
    notfound: "not_found",
    unauthorized: "unauthorized",
    invalidTokenType: "invalid_token_type",
    duplicate: "duplicate",
    jwtGeneral: "jwt_general",
    jwtExpired: "jwt_expired",
    validation: "validation",
    badRequest: "bad_request",
    foreignKeyViolation: "foreign_key_violation",
}

class DatabaseDataError extends Error {
    constructor(message, code) {
        super(message)
        this.name = "DatabaseDataError"
        this.code = code
    }
}

class DuplicateEntityError extends DatabaseDataError {
    constructor(message) {
        super(message, exceptionCodes.duplicate)
        this.name = "DuplicateEntityError"
    }
}

class ForeignKeyError extends DatabaseDataError {
    constructor(message) {
        super(message, exceptionCodes.foreignKeyViolation)
        this.name = "ForeignKeyError"
    }
}

class HttpError extends Error {
    constructor(status, code, message) {
        super(`${status}: ${message}`)
        this.name = "HttpError"

        this.status = status
        this.code = code
    }
}

class UnauthorizedError extends HttpError {
    constructor(message = "Not logged in", code = exceptionCodes.unauthorized) {
        super(401, code, message)
    }
}

class NotFoundError extends HttpError {
    constructor(message = "Not found") {
        super(404, exceptionCodes.notfound, message)
    }
}

class BadRequest extends HttpError {
    constructor(message = "Bad request") {
        super(400, exceptionCodes.badRequest, message)
    }
}

class DatabaseError extends Error {
    constructor(code, errName, message) {
        super(message)
        this.name = "DatabaseError"

        this.code = code
        this.errName = errName
    }
}

module.exports = {
    DatabaseDataError,
    DuplicateEntityError,
    ForeignKeyError,
    DatabaseError,
    HttpError,
    UnauthorizedError,
    NotFoundError,
    BadRequest,
    exceptionCodes,
}
