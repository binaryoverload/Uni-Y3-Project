const validator = require("validator")
const jwt = require("jsonwebtoken")
const config = require("../utils/config")
const { respondFail, respondToJwtError } = require("../utils/http")
const { authorizeUser, getSafeUser } = require("../services/user")

const validateJwt = async (req, res, next) => {
    if (!req.headers.authorization) {
        respondFail(res, 401, { message: "Missing authorization header" })
        return
    }

    const authHeader = req.headers.authorization

    const accessToken = authHeader.split(" ")[1]

    if (!(authHeader.startsWith("Bearer ") && validator.isJWT(accessToken))) {
        respondFail(res, 401, { message: "Authorization header malformed" })
        return
    }

    let decoded = undefined
    try {
        decoded = jwt.verify(accessToken, config.jwt.secret)
    } catch (e) {
        respondToJwtError(res, e)
        return
    }

    if (decoded?.token_type !== "access") {
        respondFail(res, 401, { token_type: `Token type is invalid. Expected 'refresh' got '${decoded.token_type}'` })
        return
    }

    const { username, checksum } = decoded

    const { success, user } = await authorizeUser(res, username, checksum)

    if (!success)
        return

    req.user = getSafeUser(user)

    next()
}

module.exports = { validateJwt }