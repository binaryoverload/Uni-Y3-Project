const { Router } = require("express")
const jwt = require("jsonwebtoken")

const { refresh: refreshValidator, login: loginValidator } = require("../validation/auth")
const { signAccessJwt, signRefreshJwt } = require("../utils/jwt")

const config = require("../utils/config")
const { checkValidationErrors, executeQuery } = require("../utils/http")
const { getUserByUsername } = require("../models/user")
const { verifyPassword } = require("../utils/password")
const { authorizeUser } = require("../services/user")
const { UnauthorizedError, exceptionCodes } = require("../utils/httpExceptions")

const router = Router()

router.post(
    "/login",
    checkValidationErrors(loginValidator),
    executeQuery(async ({ body }) => {
        const { username, password } = body

        const user = await getUserByUsername(username)

        if (user == null) {
            throw new UnauthorizedError("Invalid username or password")
        }

        if (!(await verifyPassword(user.password, password))) {
            throw new UnauthorizedError("Invalid username or password")
        }

        const accessToken = signAccessJwt(username, user.checksum)
        const refreshToken = signRefreshJwt(username, user.checksum)

        return { access_token: accessToken, refresh_token: refreshToken }
    })
)

router.post(
    "/refresh",
    checkValidationErrors(refreshValidator),
    executeQuery(async ({ body }) => {
        const { refresh_token: refreshToken } = body

        let decoded = jwt.verify(refreshToken, config.jwt.secret)

        if (decoded?.token_type !== "refresh") {
            throw new UnauthorizedError(
                `Token type is invalid. Expected 'refresh' got '${decoded.token_type}'`,
                exceptionCodes.invalidTokenType
            )
        }

        const { username, checksum } = decoded

        const user = await authorizeUser(username, checksum)

        return {
            access_token: signAccessJwt(user.username, user.checksum),
            refresh_token: signRefreshJwt(username, user.checksum),
        }
    })
)

module.exports = router
