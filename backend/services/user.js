const { getUserByUsername } = require("../models/user")
const { respondFail } = require("../utils/http")
const { UnauthorizedError } = require("../utils/httpExceptions")

async function authorizeUser (username, checksum) {
    const user = await getUserByUsername(username)

    if (!user) {
        throw new UnauthorizedError("User does not exist")
    }

    if (user.checksum !== checksum) {
        throw new UnauthorizedError()
    }

    return user
}

// Create a "safe" user object without any security information to be passed around
function getSafeUser (user) {
    if (!user) return null

    const { id, username, first_name, last_name, updated_at } = user

    return {
        id,
        username,
        first_name,
        last_name,
        updated_at
    }
}

module.exports = { authorizeUser, getSafeUser }