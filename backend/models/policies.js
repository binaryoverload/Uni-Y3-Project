const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")
const { getUserById } = require("./user")
const { BadRequest } = require("../utils/exceptions")

const policiesTableName = "policies"

async function createPolicy (created_by) {

    if (!await getUserById(created_by)) {
        throw new BadRequest(`User with ID ${created_by} not found`)
    }

    return await knex(policiesTableName)
        .insert({
            created_by
        })
        .returning("id")
        .first()
        .catch(handlePostgresError)
}

async function getById (id) {
    return await knex(policiesTableName)
        .withRelations(knex(policyItemsTableName), "id", "policy_id")
        .where("id", id)
        .first()
        .catch(handlePostgresError)
}

async function getAll () {
    return await knex(policiesTableName)
        .withRelations(knex(policyItemsTableName), "id", "policy_id")
        .first()
        .catch(handlePostgresError)
}