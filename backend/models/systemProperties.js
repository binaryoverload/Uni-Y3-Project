const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")

const systemPropertiesTableName = "system_properties"

async function getSystemProperty (key) {
    return await knex(systemPropertiesTableName)
        .where("key", key)
        .returning("value")
        .catch(handlePostgresError)
}

async function getAllSystemProperties () {
    return await knex(systemPropertiesTableName)
        .select(["key", "value"])
        .catch(handlePostgresError)
}

async function setSystemProperty (key, value) {
    return await knex(systemPropertiesTableName)
        .insert({ key, value })
        .onConflict()
        .merge()
        .catch(handlePostgresError)
}

async function deleteSystemProperty (key) {
    return await knex(systemPropertiesTableName)
        .where("key", key)
        .delete()
        .catch(handlePostgresError)
}

module.exports = { getSystemProperty, getAllSystemProperties, setSystemProperty, deleteSystemProperty }