const { Router } = require("express")
const uuid = require("uuid")
const path = require("path")

const { validateJwt } = require("../middlewares/validateJwt")
const { executeQuery, checkValidationErrors } = require("../utils/http")
const config = require("../utils/config")
const { createFile, getFileById } = require("../models/files")
const { idParamValidator } = require("../validation/common")

const router = Router()

router.post(
    "/upload",
    validateJwt,
    executeQuery(async ({ req }) => {
        const id = uuid.v4()

        const { file } = req.files

        if (file) {
            await file.mv(path.join(config.files.uploadDirectory, id))

            if (file) {
                const createdFile = await createFile({
                    id,
                    name: file.name,
                    original_filename: file.name,
                    hash: file.md5,
                    size: file.size,
                })

                file.mv(path.join(config.files.uploadDirectory, id))
                return createdFile
            }
        }
    })
)

router.get(
    "/:id",
    validateJwt,
    checkValidationErrors(idParamValidator),
    executeQuery(async ({ params }) => {
        return getFileById(params.id)
    })
)

module.exports = router
