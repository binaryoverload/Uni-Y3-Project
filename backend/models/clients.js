const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")

const CLIENTS_TABLE_NAME = "users"

async function createClient (data) {
    const { name, public_key, mac_address, os_information, labels } = data

    return await knex(CLIENTS_TABLE_NAME)
        .insert({
            name,
            public_key,
            mac_address,
            os_information,
            labels
        })
        .returning("id")
        .then(r => {
            return { id: r[0] }
        })
        .catch(handlePostgresError)
}

async function deleteClient (id) {
    return await knex(CLIENTS_TABLE_NAME)
        .where("id", id)
        .delete()
        .returning("id")
        .catch(handlePostgresError)
}

async function updateClient (id, data) {
    const {
        name,
        public_key,
        last_activity,
        mac_address,
        last_known_ip,
        last_known_hostname,
        os_information,
        labels
    } = data

    return await knex(CLIENTS_TABLE_NAME)
        .update({
            name,
            public_key,
            last_activity,
            mac_address,
            last_known_ip,
            last_known_hostname,
            os_information,
            labels
        })
        .where("id", id)
        .catch(handlePostgresError)
}

async function getClientById (id) {
    return await knex(CLIENTS_TABLE_NAME)
        .select([
            "id",
            "name",
            "public_key",
            "last_activity",
            "mac_address",
            "last_known_ip",
            "last_known_hostname",
            "os_information",
            "labels"])
        .where("id", id)
        .first()
        .catch(handlePostgresError)
}

async function getAllClients (id) {
    return await knex(CLIENTS_TABLE_NAME)
        .select([
            "id",
            "name",
            "public_key",
            "last_activity",
            "mac_address",
            "last_known_ip",
            "last_known_hostname",
            "os_information",
            "labels"])
        .first()
        .catch(handlePostgresError)
}

module.exports = {
    createClient,
    deleteClient,
    updateClient,
    getClientById,
    getAllClients
}