const validator = require("validator")
const jwt = require("jsonwebtoken")
const config = require("../utils/config")
const { respondFail, respondToJwtError } = require("../utils/http")

const validateJwt = (req, res, next) => {
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

    const { username, revocation_uuid: revocationUUID } = decoded

    // TODO: Get user from DB
    const user = { username }

    if (!user) {
        respondFail(res, 401, { message: "User not found" })
        return
    }

    req.user = user

    next()
}

module.exports = { validateJwt }