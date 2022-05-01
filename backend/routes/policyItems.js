const { validateJwt } = require("../middlewares/validateJwt")
const { executeQuery, checkValidationErrors } = require("../utils/http")
const { NotFoundError } = require("../utils/httpExceptions")
const { Router } = require("express")
const { idParamValidator } = require("../validation/common")
const {
    getAllPolicyItems,
    getPolicyItemsForPolicy,
    createPolicyItem,
    getPolicyItem,
    deletePolicyItem,
} = require("../models/policyItems")
const { policyItemCreate } = require("../validation/policyItems")

const router = Router()

router.get(
    "/",
    validateJwt,
    executeQuery(async ({ params }) => {
        if (params.policy_id) {
            return getPolicyItemsForPolicy(params.policy_id)
        }
        return getAllPolicyItems()
    })
)

router.post(
    "/",
    validateJwt,
    checkValidationErrors(policyItemCreate),
    executeQuery(async ({ body }) => {
        const { policy_id, type, data } = body
        return await createPolicyItem({ policy_id, type, data })
    })
)

router.get(
    "/:id",
    validateJwt,
    checkValidationErrors(idParamValidator),
    executeQuery(async ({ params }) => {
        return getPolicyItem(params.id)
    })
)

router.delete(
    "/:id",
    validateJwt,
    checkValidationErrors(idParamValidator),
    executeQuery(async ({ params }) => {
        const deletedId = await deletePolicyItem(params.id)

        if (!deletedId || deletedId.length === 0) throw new NotFoundError()

        return deletedId
    })
)

// router.patch(
//     "/:id",
//     validateJwt,
//     checkValidationErrors(clientPatch),
//     executeQuery(async ({ params, body }) => {
//         return await updatePolicy(params.id, body)
//     })
// )

module.exports = router
