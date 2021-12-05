const { Pool } = require("pg")
const PostgresError = require("pg-error-enum").PostgresError

const config = require("../utils/config")
const { logger } = require("../utils/logger")
const exitCodes = require("../utils/exitCodes")
const { handlePostgresError } = require("../utils/errorHandling")

const { user, password, host, port, db } = config.postgres

const connectionString = `postgresql://${user}:${password}@${host}:${port}/${db}`

const pool = new Pool({
    connectionString,
    idleTimeoutMillis: 1000 * 60
})

const logLabel = { label: "postgres" }

pool.on("connect", client => {
    logger.info(`Client ${pool.totalCount} connected to ${host}:${port} `, logLabel)
})

pool.on("remove", () => {
    logger.debug(`Client removed from pool. Idle: ${pool.idleCount} Total: ${pool.totalCount}`)
})

pool.on("error", (err, _) => {
    logger.error(`Error in pool: ${err.message}`, logLabel)
})

async function queryPool (query, values) {
    let client = null
    try {
        client = await pool.connect()
        return await client.query(query, values)
    } catch (err) {
        handlePostgresError(err)
    } finally {
        client?.release()
    }
}

function verifyConnection () {
    pool.query("SELECT 1")
        .then(() => logger.info("Successfully verified connection", logLabel))
        .catch((err) => {
            logger.error(`Error verifying connection: ${err.message}`, logLabel)
            process.exit(exitCodes.postgresError)
        })
}

module.exports = { pool, queryPool, verifyConnection, PgError: PostgresError }