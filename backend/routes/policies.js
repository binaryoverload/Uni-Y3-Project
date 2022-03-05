const { validateJwt } = require("../middlewares/validateJwt")
const { executeQuery, checkValidationErrors } = require("../utils/http")

const { clientPatch } = require("../validation/clients")
const { NotFoundError } = require("../utils/httpExceptions")
const { Router } = require("express")
const { getAllPolicies, getPolicyById, deletePolicy, updatePolicy } = require("../models/policies")
const { idParamValidator } = require("../validation/common")

const router = Router()

router.get(
    "/",
    validateJwt,
    executeQuery(async () => {
        return getAllPolicies()
    })
)

router.get(
    "/:id",
    validateJwt,
    checkValidationErrors(idParamValidator),
    executeQuery(async ({ params }) => {
        return getPolicyById(params.id)
    })
)

router.delete(
    "/:id",
    validateJwt,
    checkValidationErrors(idParamValidator),
    executeQuery(async ({ params }) => {
        const deletedId = await deletePolicy(params.id)

        if (!deletedId || deletedId.length === 0) throw new NotFoundError()

        return deletedId
    })
)

router.patch(
    "/:id",
    validateJwt,
    checkValidationErrors(clientPatch),
    executeQuery(async ({ params, body }) => {
        return await updatePolicy(params.id, body)
    })
)

module.exports = router
