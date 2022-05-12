const { knex } = require("../setup/db")
const { handlePostgresError } = require("../utils/errorHandling")

const FILES_TABLE_NAME = "files"

async function createFile(data) {
    const { id, name, original_filename, hash, size } = data

    return await knex(FILES_TABLE_NAME)
        .insert({
            id,
            name,
            original_filename,
            hash,
            size,
        })
        .returning("id")
        .then(r => {
            return { id: r[0] }
        })
        .catch(handlePostgresError)
}

async function deleteFile(id) {
    return await knex(FILES_TABLE_NAME).where("id", id).delete().returning("id").catch(handlePostgresError)
}

async function getFileById(id) {
    return await knex(FILES_TABLE_NAME)
        .select(["id", "name", "original_filename", "hash", "size", "created_at"])
        .where("id", id)
        .first()
        .catch(handlePostgresError)
}

async function getAllFiles() {
    return await knex(FILES_TABLE_NAME)
        .select(["id", "name", "original_filename", "hash", "size", "updated_at"])
        .first()
        .catch(handlePostgresError)
}

module.exports = {
    createFile,
    deleteFile,
    getFileById,
    getAllFiles,
}
