const validator = require("validator")
const jwt = require("jsonwebtoken")
const config = require("../utils/config")
const { authorizeUser, getSafeUser } = require("../services/user")
const { UnauthorizedError, exceptionCodes } = require("../utils/httpExceptions")

const validateJwt = async (req, res, next) => {
    if (!req.headers.authorization) {
        throw new UnauthorizedError("Missing authorization header")
    }

    const authHeader = req.headers.authorization

    const accessToken = authHeader.split(" ")[1]

    if (!(authHeader.startsWith("Bearer ") && validator.isJWT(accessToken))) {
        throw new UnauthorizedError("Authorization header malformed")
    }

    const decoded = jwt.verify(accessToken, config.jwt.secret)

    if (decoded?.token_type !== "access") {
        throw new UnauthorizedError(
            `Token type is invalid. Expected 'refresh' got '${decoded.token_type}'`,
            exceptionCodes.invalidTokenType
        )
    }

    const { username, checksum } = decoded

    req.user = getSafeUser(await authorizeUser(username, checksum))

    next()
}

const validateJwtQuery = async (req, res, next) => {
    const { auth_token: accessToken } = req.query

    if (!accessToken) {
        throw new UnauthorizedError("Authorization header malformed")
    }

    if (!validator.isJWT(accessToken)) {
        throw new UnauthorizedError("Authorization header malformed")
    }

    const decoded = jwt.verify(accessToken, config.jwt.secret)

    if (decoded?.token_type !== "access") {
        throw new UnauthorizedError(
            `Token type is invalid. Expected 'refresh' got '${decoded.token_type}'`,
            exceptionCodes.invalidTokenType
        )
    }

    const { username, checksum } = decoded

    req.user = getSafeUser(await authorizeUser(username, checksum))

    next()
}

module.exports = { validateJwt, validateJwtQuery }
