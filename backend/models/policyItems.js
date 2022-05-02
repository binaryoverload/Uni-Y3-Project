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

    const newOrder = maxOrder != null ? maxOrder + 1 : 0

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
    const deletedObject = await knex(POLICY_ITEMS_TABLE_NAME)
        .where("id", id)
        .delete()
        .returning(["id", "policy_id", "policy_order"])
        .catch(handlePostgresError)
        .then(r => r[0]) // We only care about the 1st object, there should only ever be 1

    if (deletedObject != null) {
        await knex(POLICY_ITEMS_TABLE_NAME)
            .where("policy_id", deletedObject.policy_id)
            .where("policy_order", ">", deletedObject.policy_order)
            .decrement("policy_order", 1)
            .catch(handlePostgresError)
    }

    return deletedObject
}

async function updatePolicyItem(id, data) {}

async function getPolicyItem(id) {
    return await knex(POLICY_ITEMS_TABLE_NAME)
        .select(["id", "policy_id", "policy_order", "type", "stop_on_error", "data"])
        .where("id", id)
        .first()
        .catch(handlePostgresError)
}

async function getPolicyItemsForPolicy(policy_id) {
    return await knex(POLICY_ITEMS_TABLE_NAME)
        .select(["id", "policy_id", "policy_order", "type", "stop_on_error", "data"])
        .where("policy_id", policy_id)
        .catch(handlePostgresError)
}

async function getAllPolicyItems() {
    return await knex(POLICY_ITEMS_TABLE_NAME)
        .select(["id", "policy_id", "policy_order", "type", "stop_on_error", "data"])
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
