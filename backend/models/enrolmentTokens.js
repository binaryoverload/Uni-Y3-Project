const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")

const enrolmentTableName = "enrolment_tokens"

async function getEnrolmentToken (id) {
    return await knex(enrolmentTableName)
        .select(["id", "token", "created_at", "expires_at", "usage_current", "usage_limit"])
        .where("id", id)
        .catch(handlePostgresError)
}

async function getAllEnrolmentTokens() {
    return await knex(enrolmentTableName)
        .select(["id", "token", "created_at", "expires_at", "usage_current", "usage_limit"])
        .catch(handlePostgresError)
}

async function deleteEnrolmentToken(id) {
    return await knex(enrolmentTableName)
        .where("id", id)
        .delete()
        .catch(handlePostgresError)
}

async function createEnrolmentToken(token) {
    return await knex(enrolmentTableName)
        .insert({ token })
        .returning(["id", "token", "created_at", "usage_current"])
        .catch(handlePostgresError)
}

async function updateEnrolmentToken(id, data) {
    const { expires_at, usage_current, usage_limit } = data

    return await knex(enrolmentTableName)
        .update({ expires_at, usage_current, usage_limit })
        .where("id", id)
        .catch(handlePostgresError)
}

module.exports = { getAllEnrolmentTokens, getEnrolmentToken, deleteEnrolmentToken, createEnrolmentToken, updateEnrolmentToken }