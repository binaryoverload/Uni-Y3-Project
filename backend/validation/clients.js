const { body, param } = require("express-validator")

const clientIdValidator = param("id", "User ID is required")
    .exists()
    .isUUID(4)
    .withMessage("User ID must be a UUID v4")

module.exports = {
    clientGetId: [
        clientIdValidator
    ],
    clientDelete: [
        clientIdValidator
    ],
    clientPatch: [
        clientIdValidator,
        // TODO
    ]
}