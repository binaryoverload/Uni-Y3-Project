const validator = require("validator")
const jwt = require("jsonwebtoken")
const config = require("../config")

const validateJwt = (req, res, next) => {
    if (!req.headers.authorization) {
        // TODO: Return 401
    }

    const authHeader = req.headers.authorization

    if (!authHeader.startsWith("Bearer ") || validator.isJwt(authHeader.split(" ")[1])) {
        // TODO: Return 400
    }

    const accessToken = authHeader.split(" ")[1]

    let decoded = undefined
    try {
        decoded = jwt.verify(accessToken, config.jwt.secret)
    } catch (e) {
        // TODO: Return 401
    }

    if (decoded?.token_type !== "access") {
        // TODO: Return 401
    }

    const { username, revocation_uuid: revocationUUID } = decoded

    // TODO: Get user from DB
    const user = { username }

    if (!user) {
        // TODO: Return 401
    }

    req.user = user

    next()
}

module.exports = { validateJwt }