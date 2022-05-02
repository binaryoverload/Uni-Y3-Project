const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")
const { hashPassword } = require("../utils/password")

const USERS_TABLE_NAME = "users"

async function createUser(data) {
    const { username, password, first_name, last_name } = data

    const hashedPassword = await hashPassword(password)

    return await knex(USERS_TABLE_NAME)
        .insert({
            username,
            password: hashedPassword,
            first_name,
            last_name,
        })
        .returning("id")
        .then(r => {
            return { id: r[0] }
        })
        .catch(handlePostgresError)
}

async function getUserByUsername(username) {
    return await knex(USERS_TABLE_NAME)
        .select(["id", "username", "password", "checksum", "first_name", "last_name", "updated_at"])
        .where("username", username)
        .first()
        .catch(handlePostgresError)
}

async function getUserById(id) {
    return await knex(USERS_TABLE_NAME)
        .select(["id", "username", "password", "checksum", "first_name", "last_name", "updated_at"])
        .where("id", id)
        .first()
        .catch(handlePostgresError)
}

async function getAllUsers() {
    return await knex(USERS_TABLE_NAME)
        .select(["id", "username", "password", "checksum", "first_name", "last_name", "updated_at"])
        .catch(handlePostgresError)
}

async function deleteUser(id) {
    return await knex(USERS_TABLE_NAME).where("id", id).delete().returning("id").catch(handlePostgresError)
}

async function updateUser(id, data) {
    const { username, first_name, last_name, password } = data

    const hashedPassword = await hashPassword(password)

    let query = knex(USERS_TABLE_NAME)
        .where("id", id)
        .update({
            username,
            password: hashedPassword,
            first_name,
            last_name,
            updated_at: new Date(),
        })
        .returning("*")

    if (password) {
        query = query.increment("security_stamp")
    }

    return await query.catch(handlePostgresError)
}

module.exports = { USERS_TABLE_NAME, createUser, getUserByUsername, getUserById, getAllUsers, deleteUser, updateUser }
