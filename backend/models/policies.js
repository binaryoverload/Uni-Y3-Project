const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")
const { getUserById } = require("./user")
const { BadRequest } = require("../utils/exceptions")

const POLICIES_TABLE_NAME = "policies"

async function createPolicy (created_by) {

    if (!await getUserById(created_by)) {
        throw new BadRequest(`User with ID ${created_by} not found`)
    }

    return await knex(POLICIES_TABLE_NAME)
        .insert({
            created_by
        })
        .returning("id")
        .first()
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
        .withRelations(knex(policyItemsTableName), "id", "policy_id")
        .where("id", id)
        .first()
        .catch(handlePostgresError)
}

async function getAll () {
    return await knex(POLICIES_TABLE_NAME)
        .withRelations(knex(policyItemsTableName), "id", "policy_id")
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