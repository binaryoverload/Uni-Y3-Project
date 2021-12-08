const { body, param } = require("express-validator")

const tokenIdValidator = param("id", "ID must be a UUIDv4")
    .exists()
    .isUUID(4)

module.exports = {
    tokenGet: [
        tokenIdValidator
    ],
    tokenDelete: [
        tokenIdValidator
    ],
    tokenUpdate: [
        tokenIdValidator,
        body("expires_at", "Expires at must be null or a epoch value")
            .optional({ nullable: true })
            .isInt(),
        body("usage_limit", "Usage limit must be null or a epoch value")
            .optional({ nullable: true })
            .isInt(),
    ],
    tokenCreate: [

    ]
}