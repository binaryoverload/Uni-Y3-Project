const { getUserByUsername } = require("../models/user")
const { respondFail } = require("../utils/http")

async function authorizeUser (res, username, checksum) {
    const user = await getUserByUsername(username)

    if (!user) {
        respondFail(res, 401, { message: "User does not exist" })
        return { success: false }
    }

    if (user.checksum !== checksum) {
        respondFail(res, 401)
        return { success: false }
    }

    return { success: true, user }
}

// Create a "safe" user object without any security information to be passed around
function getSafeUser(user) {
    if (!user) return null

    const { username, first_name, last_name } = user

    return {
        username,
        first_name,
        last_name
    }
}

module.exports = { authorizeUser, getSafeUser }