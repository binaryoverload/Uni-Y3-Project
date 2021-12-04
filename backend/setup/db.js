const { Pool, Client } = require('pg')

const config = require("../utils/config")
const { logger } = require("../utils/logger")
const exitCodes = require("../utils/exitCodes")

const { user, password, host, port, db } = config.postgres

const connectionString = `postgresql://${user}:${password}@${host}:${port}/${db}`

const pool = new Pool({
    connectionString,
})

const logLabel = { label: "postgres" }

pool.on("connect", client => {
    logger.info(`Client connected to ${host}:${port}`, logLabel)
})

pool.on("error", (err, _) => {
    logger.error(`Error in pool: ${err.message}`, logLabel)
})

async function queryPool(query, values) {
    try {
        const client = await pool.connect()
        const result = await client.query(query, values)

        client.release()

        return result
    } catch (err) {
        logger.error(`Error querying DB: ${err.message}`, logLabel)
    }
}

function verifyConnection() {
    pool.query("SELECT 1")
        .then(() => logger.info("Successfully verified connection", logLabel))
        .catch((err) => {
            logger.error(`Error verifying connection: ${err.message}`, logLabel)
            process.exit(exitCodes.postgresError)
        })
}

module.exports = { pool, queryPool, verifyConnection }