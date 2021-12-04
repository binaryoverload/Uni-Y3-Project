const { Router } = require("express")

const config = require("../utils/config")
const { checkValidationErrors, respondFail, respondSuccess } = require("../utils/http")
const { createUser } = require("../models/user")
const { DuplicateEntityError } = require("../utils/exceptions")

const router = Router()

router.post("/", (async (req, res) => {

    const { username, password: hashedPassword, first_name: firstName, last_name: lastName } = req.body

    try {
        const data = await createUser({ username, hashedPassword, firstName, lastName })
        respondSuccess(res, 200, data)
    } catch (err) {
        if (err instanceof DuplicateEntityError) {
            respondFail(res, 400, {
                code: "duplicate",
                username: "A user with this username already exists"
            })
            return
        }
    }

}))


module.exports = router