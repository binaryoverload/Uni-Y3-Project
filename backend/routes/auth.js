const { Router } = require("express")
const jwt = require("jsonwebtoken")

const { refresh: refreshValidator, login: loginValidator } = require("../validation/auth")
const { signAccessJwt, signRefreshJwt } = require("../utils/jwt")

const config = require("../config")
const { checkValidationErrors, respondFail, respondError } = require("../utils/http")

const router = Router()

router.post("/login", loginValidator, (req, res) => {

    if (!checkValidationErrors(req, res)) {
        return
    }

    const { username, password } = req.body

    // TODO: Check against db, check password hash not plaintext
    if (username !== "admin" || password !== "admin") {
        respondFail(res, 401, { message: "Invalid username or password" })
        return
    }

    const accessToken = signAccessJwt(username, "hi")
    const refreshToken = signRefreshJwt(username, "hi")

    res.send({ access_token: accessToken, refresh_token: refreshToken })
})

router.post("/refresh", refreshValidator, (req, res) => {

    if (!checkValidationErrors(req, res)) {
        return
    }

    const { refresh_token: refreshToken } = req.body

    let decoded = undefined
    try {
        decoded = jwt.verify(refreshToken, config.jwt.secret)
    } catch (e) {
        respondFail(res, 401, {
            "message": `JWT: ${e.message}`
        })
        return
    }

    if (decoded?.token_type !== "refresh") {
        respondFail(res, 401, { token_type: `Token type is invalid. Expected 'refresh' got '${decoded.token_type}'` })
        return
    }

    // TODO: Get user from DB

    res.send({ access_token: signAccessJwt("admin", "hi") })
})

module.exports = router