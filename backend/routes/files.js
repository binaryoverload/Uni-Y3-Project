const { Router } = require("express")
const uuid = require("uuid")
const path = require("path")
const fsp = require("fs/promises")

const { validateJwt } = require("../middlewares/validateJwt")
const { executeQuery, checkValidationErrors } = require("../utils/http")
const config = require("../utils/config")
const { createFile, getFileById, getAllFiles, deleteFile } = require("../models/files")
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

router.delete(
    "/:id",
    validateJwt,
    checkValidationErrors(idParamValidator),
    executeQuery(async ({ params }) => {
        const filePath = path.join(config.files.uploadDirectory, params.id)
        await fsp.rm(filePath, { force: true })
        return deleteFile(params.id)
    })
)

router.get(
    "/",
    validateJwt,
    executeQuery(async () => {
        return getAllFiles()
    })
)

module.exports = router
