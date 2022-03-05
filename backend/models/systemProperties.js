const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")

const SYSTEM_PROPERTIES_TABLE_NAME = "system_properties"

async function getSystemProperty(key) {
    return await knex(SYSTEM_PROPERTIES_TABLE_NAME)
        .where("key", key)
        .returning(["key", "value"])
        .first()
        .catch(handlePostgresError)
}

async function getAllSystemProperties() {
    return await knex(SYSTEM_PROPERTIES_TABLE_NAME)
        .select(["key", "value"])
        .then(results => {
            return results.reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {})
        })
        .catch(handlePostgresError)
}

async function setSystemProperty(key, value) {
    return await knex(SYSTEM_PROPERTIES_TABLE_NAME)
        .insert({ key, value })
        .onConflict(["key"])
        .merge()
        .catch(handlePostgresError)
}

async function deleteSystemProperty(key) {
    return await knex(SYSTEM_PROPERTIES_TABLE_NAME).where("key", key).delete().catch(handlePostgresError)
}

module.exports = {
    SYSTEM_PROPERTIES_TABLE_NAME,
    getSystemProperty,
    getAllSystemProperties,
    setSystemProperty,
    deleteSystemProperty,
}
