const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")

const systemPropertiesTableName = "system_properties"

async function getSystemProperty (key) {
    return await knex(systemPropertiesTableName)
        .where("key", key)
        .returning(["key", "value"])
        .first()
        .catch(handlePostgresError)
}

async function getAllSystemProperties () {
    return await knex(systemPropertiesTableName)
        .select(["key", "value"])
        .then(results => {
            return results.reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {})
        })
        .catch(handlePostgresError)
}

async function setSystemProperty (key, value) {
    return await knex(systemPropertiesTableName)
        .insert({ key, value })
        .onConflict(["key"])
        .merge()
        .catch(handlePostgresError)
}

async function deleteSystemProperty (key) {
    return await knex(systemPropertiesTableName)
        .where("key", key)
        .delete()
        .catch(handlePostgresError)
}

module.exports = {
    systemPropertiesTableName,
    getSystemProperty,
    getAllSystemProperties,
    setSystemProperty,
    deleteSystemProperty
}