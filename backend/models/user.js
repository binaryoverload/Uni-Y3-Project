const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")
const { hashPassword } = require("../utils/password")

const usersTableName = "users"

async function createUser (data) {
    const { username, password, first_name, last_name } = data

    const hashedPassword = await hashPassword(password)

    return await knex(usersTableName)
        .insert({
            username,
            password: hashedPassword,
            first_name,
            last_name
        })
        .returning("id")
        .first()
        .catch(handlePostgresError)
}

async function getUserByUsername (username) {
    return await knex(usersTableName)
        .select(["id", "username", "password", "checksum", "first_name", "last_name"])
        .where("username", username)
        .first()
        .catch(handlePostgresError)
}

async function getUserById (id) {
    return await knex(usersTableName)
        .select(["id", "username", "password", "checksum", "first_name", "last_name"])
        .where("id", id)
        .first()
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
        .returning("id")
        .catch(handlePostgresError)
}

async function updateUser (id, data) {
    const { username, first_name, last_name, password } = data

    const hashedPassword = await hashPassword(password)

    let query = knex(usersTableName)
        .where("id", id)
        .update({
            username,
            password: hashedPassword,
            first_name,
            last_name
        })
        .returning("*")

    if (password) {
        query = query.increment("security_stamp")
    }

    return await query.catch(handlePostgresError)
}

module.exports = { usersTableName, createUser, getUserByUsername, getUserById, getAllUsers, deleteUser, updateUser }