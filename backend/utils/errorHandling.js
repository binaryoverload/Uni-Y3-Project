const { DatabaseError } = require("pg")
const { PostgresError } = require("pg-error-enum")
const { DuplicateEntityError, DatabaseError: DBError } = require("./exceptions")

function postgresErrorNameFromCode (code) {
    return Object.keys(PostgresError).find(key => PostgresError[key] === code)?.toLowerCase()
}

function handlePostgresError (err) {
    const errName = postgresErrorNameFromCode(err.code)
    if (!(err instanceof DatabaseError)) {
        throw err
    }
    switch (errName) {
        case "unique_violation":
            throw new DuplicateEntityError(err.detail)
        default:
            throw new DBError(err.code, errName, err.detail)
    }
}

module.exports = { postgresErrorNameFromCode, handlePostgresError }