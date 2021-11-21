const { Router } = require("express")
const { validationResult } = require("express-validator")
const { refresh: refreshValidator, login: loginValidator } = require("../validation/auth")

const router = Router()

router.post("/login", loginValidator, (req, res) => {
    res.send(validationResult(req).array({ onlyFirstError: true }))
})

router.post("/refresh", refreshValidator, (req, res) => {
    res.send(validationResult(req).array({ onlyFirstError: true }))
})

module.exports = router