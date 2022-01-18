const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")

const ENROLMENT_TOKENS_TABLE_NAME = "enrolment_tokens"

async function getEnrolmentToken (id) {
    return await knex(ENROLMENT_TOKENS_TABLE_NAME)
        .select(["id", "name", "token", "created_at", "expires_at", "usage_current", "usage_limit"])
        .where("id", id)
        .first()
        .catch(handlePostgresError)
}

async function getEnrolmentTokenByToken (token) {
    return await knex(ENROLMENT_TOKENS_TABLE_NAME)
        .select(["id", "name", "token", "created_at", "expires_at", "usage_current", "usage_limit"])
        .where("token", token)
        .first()
        .catch(handlePostgresError)
}

async function getAllEnrolmentTokens () {
    return await knex(ENROLMENT_TOKENS_TABLE_NAME)
        .select(["id", "name", "token", "created_at", "expires_at", "usage_current", "usage_limit"])
        .catch(handlePostgresError)
}

async function deleteEnrolmentToken (id) {
    return await knex(ENROLMENT_TOKENS_TABLE_NAME)
        .where("id", id)
        .delete()
        .catch(handlePostgresError)
}

async function createEnrolmentToken (name, token) {
    return await knex(ENROLMENT_TOKENS_TABLE_NAME)
        .insert({ name, token })
        .returning(["id", "name", "token", "created_at", "usage_current"])
        .then(r => r[0])
        .catch(handlePostgresError)
}

async function updateEnrolmentToken (id, data) {
    const { name, expires_at, usage_current, usage_limit } = data

    return await knex(ENROLMENT_TOKENS_TABLE_NAME)
        .update({ name, expires_at, usage_current, usage_limit })
        .where("id", id)
        .catch(handlePostgresError)
}

module.exports = {
    ENROLMENT_TOKENS_TABLE_NAME,
    getAllEnrolmentTokens,
    getEnrolmentToken,
    getEnrolmentTokenByToken,
    deleteEnrolmentToken,
    createEnrolmentToken,
    updateEnrolmentToken
}