const { Router } = require("express")
const { executeQuery, checkValidationErrors } = require("../utils/http")
const { getAllSystemProperties, getSystemProperty, setSystemProperty, deleteSystemProperty } = require("../models/systemProperties")
const { validateJwt } = require("../middlewares/validateJwt")
const { propertyGet, propertySet, propertyDelete } = require("../validation/systemProperties")
const { NotFoundError } = require("../utils/httpExceptions")

const router = Router()

router.get("/", validateJwt, executeQuery(async () => {
    return await getAllSystemProperties()
}))

router.get("/:key", validateJwt, checkValidationErrors(propertyGet), executeQuery(async ({ params }) => {
    return await getSystemProperty(params.key)
}))

router.post("/:key", validateJwt, checkValidationErrors(propertySet), executeQuery(async ({ params, body }) => {
    await setSystemProperty(params.key, body.value)
    return true
}))

router.delete("/:key", validateJwt, checkValidationErrors(propertyDelete), executeQuery(async ({ params }) => {
    const rowsDeleted = await deleteSystemProperty(params.key)

    if (rowsDeleted > 0) {
        return true
    }

    throw new NotFoundError()
}))

module.exports = router