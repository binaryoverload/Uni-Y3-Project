const { Router } = require("express")
const uuid = require("uuid")
const path = require("path")

const { validateJwt } = require("../middlewares/validateJwt")
const { executeQuery } = require("../utils/http")
const config = require("../utils/config")
const { createFile } = require("../models/files")
const { BadRequest } = require("../utils/httpExceptions")

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

        await createFile({
            id,
            name: file.name,
            original_filename: file.name,
            hash: file.md5,
            size: file.size,
            owner_user: "root"
        })

        return await file.mv(path.join(config.files.uploadDirectory, id))

    }

module.exports = router
