const { Pool } = require("pg")
const PostgresError = require("pg-error-enum").PostgresError

const config = require("../utils/config")
const { logger } = require("../utils/logger")
const exitCodes = require("../utils/exitCodes")
const { handlePostgresError } = require("../utils/errorHandling")

require("knex-with-relations")

const { user, password, host, port, db } = config.postgres

const logLabel = { label: "postgres" }

const knex = require("knex")({
    client: "pg",
    connection: {
        host,
        port,
        user,
        password,
        database: db
    },
    pool: {
        min: 0,
        max: 10,
        afterCreate (client, done) {
            logger.info(`Client connected to ${host}:${port} `, logLabel)
            done()
        }
    },
    log: {
        warn (message) { logger.warn(JSON.stringify(message), logLabel) },
        debug (message) { logger.debug(JSON.stringify(message), logLabel) },
        error (message) { logger.error(JSON.stringify(message), logLabel) },
        deprecate (method, alternative) { logger.warn(`Knex Deprecated: ${method} -> ${alternative}`) }
    }
})

function verifyConnection () {
    knex.raw("SELECT 1")
        .then(() => logger.info("Successfully verified connection", logLabel))
        .catch((err) => {
            logger.error(`Error verifying connection: ${err.message}`, logLabel)
            process.exit(exitCodes.postgresError)
        })
}

module.exports = { knex, verifyConnection, PgError: PostgresError }