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

module.exports = { createUser, getUserByUsername }