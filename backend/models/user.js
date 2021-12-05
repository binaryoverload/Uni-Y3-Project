const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")

const usersTableName = "users"

async function createUser (data) {
    const { username, hashedPassword, first_name, last_name } = data

    return await knex(usersTableName)
        .insert({
            username,
            password: hashedPassword,
            first_name,
            last_name
        })
        .returning("id")
        .catch(handlePostgresError)
}

async function getUserByUsername (username) {
    return await knex(usersTableName)
        .select(["id", "username", "password", "checksum", "first_name", "last_name"])
        .where("username", username)
        .catch(handlePostgresError)
}

async function getUserById (id) {
    return await knex(usersTableName)
        .select(["id", "username", "password", "checksum", "first_name", "last_name"])
        .where("id", id)
        .catch(handlePostgresError)
}

async function getAllUsers () {
    return await knex(usersTableName)
        .select(["id", "username", "password", "checksum", "first_name", "last_name"])
        .catch(handlePostgresError)
}

async function deleteUser (id) {
    return await knex(usersTableName)
        .where("id", id)
        .delete()
        .catch(handlePostgresError)
}

async function updateUser (id, data) {
    const { username, first_name, last_name, password } = data

    let query = knex(usersTableName)
        .where("id", id)
        .update({
            username,
            password,
            first_name,
            last_name
        })

    if (password) {
        query = query.increment("security_stamp")
    }

    return await query.catch(handlePostgresError)
}

module.exports = { createUser, getUserByUsername, getUserById, getAllUsers, deleteUser }