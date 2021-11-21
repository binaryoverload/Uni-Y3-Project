const { Router } = require("express")
const { validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")

const { refresh: refreshValidator, login: loginValidator } = require("../validation/auth")
const { signAccessJwt, signRefreshJwt } = require("../utils/jwt")

const config = require("../config")

const router = Router()

router.post("/login", loginValidator, (req, res) => {

    const errors = validationResult(req).array({ onlyFirstError: true })

    if (errors.length > 0) {
        // TODO: Return error
    }

    const { username, password } = req.body

    // TODO: Check against db, check password hash not plaintext
    if (username !== "admin" && password !== "admin") {
        // TODO: Return 401
    }

    const accessToken = signAccessJwt(username, "hi")
    const refreshToken = signRefreshJwt(username, "hi")

    res.send({ access_token: accessToken, refresh_token: refreshToken })
})

router.post("/refresh", refreshValidator, (req, res) => {

    const errors = validationResult(req).array({ onlyFirstError: true })

    if (errors.length > 0) {
        // TODO: Return error
    }

    const { refresh_token: refreshToken } = req.body

    let decoded = undefined
    try {
        decoded = jwt.verify(refreshToken, config.jwt.secret)
    } catch (e) {
        // TODO: Throw error
    }

    if (decoded?.token_type !== "refresh") {
        // TODO: Throw error
    }

    // TODO: Get user from DB

    res.send({ access_token: signAccessJwt("admin", "hi") })
})

module.exports = router