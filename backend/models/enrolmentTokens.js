const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")

const ENROLMENT_TOKENS_TABLE_NAME = "enrolment_tokens"

async function getEnrolmentToken (id) {
    return await knex(ENROLMENT_TOKENS_TABLE_NAME)
        .select(["id", "token", "created_at", "expires_at", "usage_current", "usage_limit"])
        .where("id", id)
        .first()
        .catch(handlePostgresError)
}

async function getAllEnrolmentTokens () {
    return await knex(ENROLMENT_TOKENS_TABLE_NAME)
        .select(["id", "token", "created_at", "expires_at", "usage_current", "usage_limit"])
        .catch(handlePostgresError)
}

async function deleteEnrolmentToken (id) {
    return await knex(ENROLMENT_TOKENS_TABLE_NAME)
        .where("id", id)
        .delete()
        .catch(handlePostgresError)
}

async function createEnrolmentToken (token) {
    const [insertedRecord] = await knex(ENROLMENT_TOKENS_TABLE_NAME)
        .insert({ token })
        .returning(["id", "token", "created_at", "usage_current"])
        .catch(handlePostgresError)
    return insertedRecord
}

async function updateEnrolmentToken (id, data) {
    const { expires_at, usage_current, usage_limit } = data

    return await knex(ENROLMENT_TOKENS_TABLE_NAME)
        .update({ expires_at, usage_current, usage_limit })
        .where("id", id)
        .catch(handlePostgresError)
}

module.exports = {
    ENROLMENT_TOKENS_TABLE_NAME,
    getAllEnrolmentTokens,
    getEnrolmentToken,
    deleteEnrolmentToken,
    createEnrolmentToken,
    updateEnrolmentToken
}