const { queryPool } = require("../setup/db")
const queries = require("./queries")

async function getEnrolmentToken (id) {
    const result = await queryPool(queries.enrolmentTokens.get, [id])

    if (result.rowCount !== 1) {
        return null
    }

    return result.rows[0]
}

async function getAllEnrolmentTokens() {
    const result = await queryPool(queries.enrolmentTokens.getAll)

    return result.rows
}

async function deleteEnrolmentToken(id) {
    const result = await queryPool(queries.enrolmentTokens.delete, [id])

    if (result.rowCount !== 1) {
        // TODO something
        return
    }

    return true
}

async function createEnrolmentToken(token) {
    const result = await queryPool(queries.enrolmentTokens.create, [token])

    if (result.rowCount === 1) {
        return result.rows[0]
    } else {
        throw Error("User not created!")
    }
}

async function updateEnrolmentToken(data) {

    const { expires_at, usage_current, usage_limit } = data

    const result = await queryPool(queries.enrolmentTokens.update, [expires_at, usage_current, usage_limit])

    if (result.rowCount !== 1) {
        // TODO something
        return
    }

    return true
}

module.exports = { getAllEnrolmentTokens, getEnrolmentToken, deleteEnrolmentToken, createEnrolmentToken, updateEnrolmentToken }