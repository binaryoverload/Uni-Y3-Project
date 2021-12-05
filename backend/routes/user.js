const { Router } = require("express")

const { checkValidationErrors, respondFail, respondSuccess } = require("../utils/http")
const { createUser } = require("../models/user")
const { DuplicateEntityError } = require("../utils/exceptions")
const { userPost } = require("../validation/user")
const { validateJwt } = require("../middlewares/validateJwt")
const { hashPassword } = require("../utils/password")

const router = Router()

router.post("/", /*validateJwt,*/ checkValidationErrors(userPost), (async (req, res) => {

    const { username, password, first_name: firstName, last_name: lastName } = req.body

    const hashedPassword = await hashPassword(password)

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