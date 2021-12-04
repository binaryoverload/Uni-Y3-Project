const { getUser } = require("../models/user")
const { respondFail } = require("../utils/http")

async function authorizeUser (res, username, checksum) {
    const user = await getUser(username)

    if (!user) {
        respondFail(res, 401, { message: "User does not exist" })
        return { success: false }
    }

    if (user.checksum !== checksum) {
        respondFail(res, 401, { message: "Checksum does not match" })
        return { success: false }
    }

    return { success: true, user }
}

module.exports = { authorizeUser }