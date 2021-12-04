class DuplicateEntityError extends Error {
    constructor (message) {
        super(message)
        this.name = "DuplicateEntityError"
    }
}

class DatabaseError extends Error {
    constructor (code, errName, message) {
        super(message)
        this.name = "DatabaseError"

        this.code = code
        this.errName  = errName
    }
}

module.exports = { DuplicateEntityError, DatabaseError }