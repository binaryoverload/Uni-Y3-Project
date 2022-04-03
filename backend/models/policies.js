const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")
const { getUserById } = require("./user")
const { ForeignKeyError } = require("../utils/httpExceptions")
const { POLICY_ITEMS_TABLE_NAME } = require("./policyItems")

const POLICIES_TABLE_NAME = "policies"

async function createPolicy(data) {
    const { name, description, created_by } = data

    // This is manually checked since there is no foreign key constraint in the DB
    // This is so a policy does not require the user to exist and may point to a deleted user in the future
    if (!(await getUserById(created_by))) {
        throw new ForeignKeyError(`User with ID ${created_by} not found`)
    }

    return await knex(POLICIES_TABLE_NAME)
        .insert({
            name,
            description,
            created_by,
        })
        .returning("id")
        .then(r => {
            return { id: r[0] }
        })
        .catch(handlePostgresError)
}

async function deletePolicy(id) {
    return await knex(POLICIES_TABLE_NAME).where("id", id).delete().returning("id").catch(handlePostgresError)
}

async function getPolicyById(id) {
    return await knex(POLICIES_TABLE_NAME)
        .withRelations(knex(POLICY_ITEMS_TABLE_NAME), "id", "policy_id")
        .then(objs => {
            return objs.find(obj => obj.id === id)
        })
        .catch(handlePostgresError)
}

async function getAllPolicies() {
    return await knex(POLICIES_TABLE_NAME)
        .withRelations(knex(POLICY_ITEMS_TABLE_NAME), "id", "policy_id")
        .catch(handlePostgresError)
}

async function updatePolicy(id, data) {
    const { name, description } = data

    return await knex(POLICIES_TABLE_NAME)
        .update({ name, description, updated_at: new Date() })
        .where("id", id)
        .catch(handlePostgresError)
}

module.exports = {
    POLICIES_TABLE_NAME,
    createPolicy,
    deletePolicy,
    updatePolicy,
    getPolicyById,
    getAllPolicies,
}
