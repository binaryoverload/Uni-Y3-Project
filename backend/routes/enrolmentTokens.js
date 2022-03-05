const { Router } = require("express")
const { checkValidationErrors, executeQuery } = require("../utils/http")
const {
    getAllEnrolmentTokens,
    getEnrolmentToken,
    deleteEnrolmentToken,
    createEnrolmentToken,
    updateEnrolmentToken,
} = require("../models/enrolmentTokens")
const { tokenUpdate, tokenCreate } = require("../validation/enrolmentTokens")
const { NotFoundError } = require("../utils/httpExceptions")

const { validateJwt } = require("../middlewares/validateJwt")
const { generateToken } = require("../services/enrolmentTokens")
const { idParamValidator } = require("../validation/common")

const router = Router()

router.get(
    "/",
    validateJwt,
    executeQuery(async () => {
        return await getAllEnrolmentTokens()
    })
)

router.get(
    "/:id",
    validateJwt,
    checkValidationErrors(idParamValidator),
    executeQuery(async ({ params }) => {
        return await getEnrolmentToken(params.id)
    })
)

router.delete(
    "/:id",
    validateJwt,
    checkValidationErrors(idParamValidator),
    executeQuery(async ({ params }) => {
        const token = await deleteEnrolmentToken(params.id)

        if (!token || token.length === 0) throw new NotFoundError()

        return token
    })
)

router.post(
    "/",
    validateJwt,
    checkValidationErrors(tokenCreate),
    executeQuery(async ({ body }) => {
        const token = generateToken()

        return await createEnrolmentToken(body.name, token)
    })
)

router.patch(
    "/:id",
    validateJwt,
    checkValidationErrors(tokenUpdate),
    executeQuery(async ({ params, body }) => {
        return await updateEnrolmentToken(params.id, body)
    })
)

module.exports = router
