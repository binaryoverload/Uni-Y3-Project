const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")

const systemPropertiesTableName = "system_properties"

async function getSystemProperty (key) {
    return await knex(systemPropertiesTableName)
        .where("key", key)
        .returning("value")
        .catch(handlePostgresError)
}

async function setSystemProperty (key, value) {
    return await knex(systemPropertiesTableName)
        .insert({ key, value })
        .onConflict()
        .merge()
        .catch(handlePostgresError)
}

module.exports = { getSystemProperty, setSystemProperty }