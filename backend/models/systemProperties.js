const { queryPool } = require("../setup/db")

async function getSystemProperty (key) {

    const query = `SELECT value FROM system_properties WHERE key=$1`

    const result = await queryPool(query, [key])

    // It is okay to check against 1, since there will only ever be 1 instance of a username due to unique constraints
    if (result.rowCount !== 1) {
        return null
    }

    return result.rows[0].value
}

async function setSystemProperty (key, value) {

    const query = `INSERT INTO system_properties (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET key = EXCLUDED.key`

    const result = await queryPool(query, [key, value])

    if (result.rowCount !== 1) {
        throw Error("Could not set property!")
    }

}

module.exports = { getSystemProperty, setSystemProperty }