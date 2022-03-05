const { validateJwt } = require("../middlewares/validateJwt")
const { checkValidationErrors, executeQuery } = require("../utils/http")
const { userGetId, userDelete, userPatch, userPost } = require("../validation/user")
const { getSafeUser } = require("../services/user")
const { getUserById, deleteUser, updateUser, getAllUsers, createUser } = require("../models/user")
const { NotFoundError } = require("../utils/httpExceptions")
const { Router } = require("express")
const { clientPost, clientPatch } = require("../validation/clients")
const { getAllClients, getClientById, deleteClient, updateClient } = require("../models/clients")
const { idParamValidator } = require("../validation/common")

const router = Router()

router.get("/", validateJwt, executeQuery(async () => {
    return getAllClients()
}))

router.get("/:id", validateJwt, checkValidationErrors(idParamValidator), executeQuery(async ({ params }) => {
    return getClientById(params.id)
}))

router.delete("/:id", validateJwt, checkValidationErrors(idParamValidator), executeQuery(async ({ params }) => {
    const deletedId = await deleteClient(params.id)

    if (!deletedId || deletedId.length === 0)
        throw new NotFoundError()

    return deletedId
}))

router.patch("/:id", validateJwt, checkValidationErrors(clientPatch), executeQuery(async ({ params, body }) => {
    return await updateClient(params.id, body)
}))

module.exports = router