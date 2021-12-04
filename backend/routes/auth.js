const { Router } = require("express")
const jwt = require("jsonwebtoken")

const { refresh: refreshValidator, login: loginValidator } = require("../validation/auth")
const { signAccessJwt, signRefreshJwt } = require("../utils/jwt")

const config = require("../utils/config")
const { checkValidationErrors, respondFail, respondToJwtError } = require("../utils/http")
const { getUser } = require("../models/user")
const { verifyPassword } = require("../utils/password")
const { authorizeUser } = require("../services/user")

const router = Router()

router.post("/login", checkValidationErrors(loginValidator), async (req, res) => {

    const { username, password } = req.body

    const user = await getUser(username)

    if (user == null) {
        respondFail(res, 401, { message: "Invalid username or password" })
        return
    }

    if (!(await verifyPassword(user.password, password))) {
        respondFail(res, 401, { message: "Invalid username or password" })
        return
    }

    const accessToken = signAccessJwt(username, user.checksum)
    const refreshToken = signRefreshJwt(username, user.checksum)

    res.send({ access_token: accessToken, refresh_token: refreshToken })
})

router.post("/refresh", checkValidationErrors(refreshValidator), async (req, res) => {

    const { refresh_token: refreshToken } = req.body

    let decoded = undefined
    try {
        decoded = jwt.verify(refreshToken, config.jwt.secret)
    } catch (e) {
        respondToJwtError(res, e)
        return
    }

    if (decoded?.token_type !== "refresh") {
        respondFail(res, 401, { token_type: `Token type is invalid. Expected 'refresh' got '${decoded.token_type}'` })
        return
    }

    const { username, checksum } = decoded

    const { success, user } = await authorizeUser(res, username, checksum)

    if (!success)
        return

    res.send({ access_token: signAccessJwt(user.username, user.checksum) })
})

module.exports = router