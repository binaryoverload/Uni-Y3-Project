const { PostgresError } = require("pg-error-enum")
const { DuplicateEntityError, InternalServerError, DatabaseError } = require("./exceptions")
const { logger } = require("./logger")

function postgresErrorNameFromCode(code) {
    return Object.keys(PostgresError).find(key => PostgresError[key] === code)?.toLowerCase()
}

function handlePostgresError(err) {
    const errName = postgresErrorNameFromCode(err.code)
    switch (errName) {
        case "unique_violation":
            throw new DuplicateEntityError(err.detail)
        default:
            throw new DatabaseError(err.code, errName, err.detail)
    }
}

module.exports = { postgresErrorNameFromCode, handlePostgresError }