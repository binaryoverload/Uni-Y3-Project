const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")

const CLIENTS_TABLE_NAME = "users"

async function createClient (data) {
    const { name, public_key, mac_address, os_information } = data;

    return await knex(CLIENTS_TABLE_NAME)
        .insert({
            name,
            public_key,
            mac_address,
            os_information
        })
        .returning("id")
        .then(r => {
            return { id: r[0] }
        })
        .catch(handlePostgresError)
}

async 