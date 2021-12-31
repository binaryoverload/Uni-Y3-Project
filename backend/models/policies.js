const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")
const { getUserById } = require("./user")
const { ForeignKeyError } = require("../utils/httpExceptions")
const { POLICY_ITEMS_TABLE_NAME } = require("./policyItems")

const POLICIES_TABLE_NAME = "policies"

async function createPolicy (created_by) {

    // This is manually checked since there is no foreign key constraint in the DB
    // This is so a policy does not require the user to exist and may point to a deleted user in the future
    if (!await getUserById(created_by)) {
        throw new ForeignKeyError(`User with ID ${created_by} not found`)
    }

    return await knex(POLICIES_TABLE_NAME)
        .insert({
            created_by
        })
        .returning("id")
        .then(r => {
            return { id: r[0] }
        })
        .catch(handlePostgresError)
}

async function deletePolicy (id) {
    return await knex(POLICIES_TABLE_NAME)
        .where("id", id)
        .delete()
        .returning("id")
        .catch(handlePostgresError)
}

async function getById (id) {
    return await knex(POLICIES_TABLE_NAME)
        .withRelations(knex(POLICY_ITEMS_TABLE_NAME), "id", "policy_id")
        .where("id", id)
        .first()
        .catch(handlePostgresError)
}

async function getAll () {
    return await knex(POLICIES_TABLE_NAME)
        .withRelations(knex(POLICY_ITEMS_TABLE_NAME), "id", "policy_id")
        .first()
        .catch(handlePostgresError)
}

module.exports = {
    POLICIES_TABLE_NAME,
    createPolicy,
    deletePolicy,
    getById,
    getAll
}