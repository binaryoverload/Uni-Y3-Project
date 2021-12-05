const { queryPool } = require("../setup/db")
const queries = require("./queries")

async function createUser (data) {
    const { username, hashedPassword, firstName, lastName } = data

    const values = [username, hashedPassword, firstName, lastName]

    if (values.some((v) => v == null)) {
        throw Error("One or more input values are undefined/null")
    }

    const result = await queryPool(queries.user.create, values)

    if (result.rowCount === 1) {
        return result.rows[0]
    } else {
        throw Error("User not created!")
    }
}

async function getUserByUsername (username) {
    const result = await queryPool(queries.user.getUsername, [username])

    // It is okay to check against 1, since there will only ever be 1 instance of a username due to unique constraints
    if (result.rowCount !== 1) {
        return null
    }

    return result.rows[0]
}

async function getUserById (id) {
    const result = await queryPool(queries.user.getId, [id])

    // It is okay to check against 1, since there will only ever be 1 instance of a username due to unique constraints
    if (result.rowCount !== 1) {
        return null
    }

    return result.rows[0]
}

async function getAllUsers () {
    const result = await queryPool(queries.user.getAll)

    return result.rows
}

async function deleteUser (id) {
    const result = await queryPool(queries.enrolmentTokens.delete, [id])

    if (result.rowCount !== 1) {
        // TODO something
        return
    }

    return true
}

async function updateUser (data) {
    const { username, first_name, last_name, password } = data
}

module.exports = { createUser, getUserByUsername, getUserById, getAllUsers, deleteUser }