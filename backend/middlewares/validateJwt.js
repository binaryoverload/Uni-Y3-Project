const validator = require("validator")
const jwt = require("jsonwebtoken")
const config = require("../config")
const { respondFail } = require("../utils/http")

const validateJwt = (req, res, next) => {
    if (!req.headers.authorization) {
        respondFail(res, 401, { message: "Missing authorization header" })
    }

    const authHeader = req.headers.authorization

    if (!authHeader.startsWith("Bearer ") || validator.isJwt(authHeader.split(" ")[1])) {
        respondFail(res, 401, { message: "Authorization header malformed" })
    }

    const accessToken = authHeader.split(" ")[1]

    let decoded = undefined
    try {
        decoded = jwt.verify(accessToken, config.jwt.secret)
    } catch (e) {
        respondFail(res, 401, {
            "message": `JWT: ${e.message}`
        })
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
    }

    req.user = user

    next()
}

module.exports = { validateJwt }