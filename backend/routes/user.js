const { Router } = require("express")

const config = require("../utils/config")
const { checkValidationErrors, respondFail } = require("../utils/http")
const { createUser } = require("../models/user")
const { DuplicateEntityError } = require("../utils/exceptions")

const router = Router()

router.post("/", (async (req, res) => {

    const { username, password: hashedPassword, first_name: firstName, last_name: lastName } = req.body

    try {
        await createUser({ username, hashedPassword, firstName, lastName })
    } catch (err) {
        if (err instanceof DuplicateEntityError) {
            respondFail(res, 400, {
                code: "duplicate",
                username: "A user with this username already exists"
            })
        }
    }
}))


module.exports = router