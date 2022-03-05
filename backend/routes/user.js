const { Router } = require("express")

const { checkValidationErrors, respondFail, respondSuccess, executeQuery } = require("../utils/http")
const { createUser, getUserById, getAllUsers, deleteUser, updateUser } = require("../models/user")
const { DuplicateEntityError, DatabaseError, HttpError, UnauthorizedError, NotFoundError } = require(
    "../utils/httpExceptions")
const { userPost, userPatch } = require("../validation/user")
const { validateJwt } = require("../middlewares/validateJwt")
const { hashPassword } = require("../utils/password")
const { getSafeUser } = require("../services/user")
const { idParamValidator } = require("../validation/common")

const router = Router()

router.get("/@me", validateJwt, executeQuery(({ user }) => {
    return getSafeUser(user)
}))

router.get("/:id", validateJwt, checkValidationErrors(idParamValidator), executeQuery(async ({ params }) => {
    return getSafeUser(await getUserById(params.id))
}))

router.delete("/:id", validateJwt, checkValidationErrors(idParamValidator), executeQuery(async ({ params }) => {
    const deletedId = await deleteUser(params.id)

    if (!deletedId || deletedId.length === 0)
        throw new NotFoundError()

    return deletedId
}))

router.patch("/:id", validateJwt, checkValidationErrors(userPatch), executeQuery(async ({ params, body }) => {
    return getSafeUser(await updateUser(params.id, body))
}))

router.get("/", validateJwt, executeQuery(async () => {
    return (await getAllUsers()).map(user => getSafeUser(user))
}))

router.post("/", /*validateJwt,*/ checkValidationErrors(userPost), executeQuery(async ({ body }) => {
    const { username, password, first_name, last_name } = body
    return await createUser({ username, password, first_name, last_name })
}))

module.exports = router