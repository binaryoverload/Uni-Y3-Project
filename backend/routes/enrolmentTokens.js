const { Router } = require("express")
const { checkValidationErrors, executeQuery } = require("../utils/http")
const { getAllEnrolmentTokens, getEnrolmentToken, deleteEnrolmentToken, createEnrolmentToken, updateEnrolmentToken } = require("../models/enrolmentTokens")
const { tokenGet, tokenDelete, tokenUpdate } = require("../validation/enrolmentTokens")
const { NotFoundError } = require("../utils/httpExceptions")
const { userPost } = require("../validation/user")
const { createUser } = require("../models/user")
const { validateJwt } = require("../middlewares/validateJwt")
const { generateToken } = require("../services/enrolmentTokens")

const router = Router()

router.get("/", validateJwt, executeQuery(async () => {
    return await getAllEnrolmentTokens()
}))

router.get("/:id", validateJwt, checkValidationErrors(tokenGet), executeQuery(async ({ params }) => {
    return await getEnrolmentToken(params.id)
}))

router.delete("/:id", validateJwt, checkValidationErrors(tokenDelete), executeQuery(async ({ params }) => {
    const token = await deleteEnrolmentToken(params.id)

    if (!token || token.length === 0)
        throw new NotFoundError()

    return token
}))

router.post("/", validateJwt, executeQuery(async () => {
    const token = generateToken()

    return await createEnrolmentToken(token)
}))

router.patch("/:id", validateJwt, checkValidationErrors(tokenUpdate), executeQuery(async ({ params, body }) => {
    return await updateEnrolmentToken(params.id, body)
}))

module.exports = router