const { queryPool } = require("../setup/db")
const queries = require("./queries")

async function getSystemProperty (key) {

    const result = await queryPool(queries.systemProperties.get, [key])

    // It is okay to check against 1, since there will only ever be 1 instance of a username due to unique constraints
    if (result.rowCount !== 1) {
        return null
    }

    return result.rows[0].value
}

async function setSystemProperty (key, value) {

    const result = await queryPool(queries.systemProperties.set, [key, value])

    if (result.rowCount !== 1) {
        throw Error("Could not set property!")
    }

}

module.exports = { getSystemProperty, setSystemProperty }