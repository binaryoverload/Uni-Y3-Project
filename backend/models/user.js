const { queryPool } = require("../setup/db")

async function createUser(data) {
    const query = `
        INSERT INTO users(username, password, first_name, last_name)
            VALUES ($1, $2, $3, $4) RETURNING id
    `

    const { username, hashedPassword, firstName, lastName } = data

    const values = [ username, hashedPassword, firstName, lastName ]

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

module.exports = { createUser }