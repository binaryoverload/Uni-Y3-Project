const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")
const { BadRequest } = require("../utils/httpExceptions")

const POLICY_ITEMS_TABLE_NAME = "policy_items"

const PolicyItemTypes = {
    FILE: "file",
    COMMAND: "command",
    PACKAGE: "package",
}

async function createPolicyItem(input_data) {
    const { policy_id, type, data } = input_data

    if (!Object.values(PolicyItemTypes).includes(type)) {
        throw new BadRequest(`The policy item type "${type}" is invalid`)
    }

    const maxOrder = (await knex(POLICY_ITEMS_TABLE_NAME).max("policy_order").where("policy_id", policy_id).first())
        ?.max

    const newOrder = maxOrder ? maxOrder + 1 : 0

    return await knex(POLICY_ITEMS_TABLE_NAME)
        .insert({
            policy_id,
            policy_order: newOrder,
            type,
            data,
        })
        .returning("id")
        .then(r => {
            return { id: r[0] }
        })
        .catch(handlePostgresError)
}

async function deletePolicyItem(id) {
    return await knex(POLICY_ITEMS_TABLE_NAME).where("id", id).delete().returning("id").catch(handlePostgresError)
}

async function updatePolicyItem(id, data) {}

async function getPolicyItem(id) {
    return await knex(POLICY_ITEMS_TABLE_NAME)
        .select(["id", "policy_id", "policy_order", "policy_item_type", "stop_on_error", "data"])
        .where("id", id)
        .first()
        .catch(handlePostgresError)
}

async function getPolicyItemsForPolicy(policy_id) {
    return await knex(POLICY_ITEMS_TABLE_NAME)
        .select(["id", "policy_id", "policy_order", "policy_item_type", "stop_on_error", "data"])
        .where("policy_id", policy_id)
        .first()
        .catch(handlePostgresError)
}

async function getAllPolicyItems() {
    return await knex(POLICY_ITEMS_TABLE_NAME)
        .select(["id", "policy_id", "policy_order", "policy_item_type", "stop_on_error", "data"])
        .first()
        .catch(handlePostgresError)
}

module.exports = {
    POLICY_ITEMS_TABLE_NAME,
    PolicyItemTypes,
    createPolicyItem,
    deletePolicyItem,
    updatePolicyItem,
    getPolicyItem,
    getAllPolicyItems,
    getPolicyItemsForPolicy,
}
