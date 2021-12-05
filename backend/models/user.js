const { queryPool } = require("../setup/db")

async function createUser (data) {
    const query = `
        INSERT INTO users(username, password, first_name, last_name)
            VALUES ($1, $2, $3, $4) RETURNING id
    `

    const { username, hashedPassword, firstName, lastName } = data

    const values = [username, hashedPassword, firstName, lastName]

    if (values.some((v) => v == null)) {
        throw Error("One or more input values are undefined/null")
    }

    const result = await queryPool(query, values)

    if (result.rowCount === 1) {
        return result.rows[0]
    } else {
        throw Error("User not created!")
    }
}

async function getUser (username) {
    const query = `
        SELECT id,username,password,first_name,last_name,checksum FROM users WHERE username=$1
    `
    const result = await queryPool(query, [username])

    // It is okay to check against 1, since there will only ever be 1 instance of a username due to unique constraints
    if (result.rowCount !== 1) {
        return null
    }

    return result.rows[0]
}

module.exports = { createUser, getUser }