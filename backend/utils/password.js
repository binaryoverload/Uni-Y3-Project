const argon2 = require("argon2")
const { argon2i } = require("argon2")

const config = require("./config")

async function hashPassword(password) {
    return argon2.hash(password, {
        type: argon2i,
        timeCost: config.passwordHashing.timeCost,
        memoryCost: config.passwordHashing.memoryCost,
        parallelism: config.passwordHashing.parallelism,
    })
}

async function verifyPassword(hash, password) {
    return argon2.verify(hash, password)
}

module.exports = { hashPassword, verifyPassword }
