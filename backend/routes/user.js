const { Router } = require("express")

const { checkValidationErrors, respondFail, respondSuccess } = require("../utils/http")
const { createUser } = require("../models/user")
const { DuplicateEntityError, DatabaseError } = require("../utils/exceptions")
const { userPost } = require("../validation/user")
const { validateJwt } = require("../middlewares/validateJwt")
const { hashPassword } = require("../utils/password")

const router = Router()

router.post("/", /*validateJwt,*/ checkValidationErrors(userPost), (async (req, res) => {

    const { username, password, first_name, last_name } = req.body

    const hashedPassword = await hashPassword(password)

    try {
        const data = await createUser({ username, hashedPassword, first_name, last_name })
        respondSuccess(res, 200, data)
    } catch (err) {
        if (err instanceof DuplicateEntityError) {
            respondFail(res, 400, {
                code: "duplicate",
                username: "A user with this username already exists"
            })
            return
        }
        throw err
    }

}))

module.exports = router