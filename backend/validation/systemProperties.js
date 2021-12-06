const { body, param } = require("express-validator")

const keyValidator = param("key", "Key must be a alpha-numeric slug")
    .exists()
    .isSlug()
    .isLength({ min: 1, max: 20 })
    .withMessage("Key must be between 1 and 20 characters long")

module.exports = {
    propertyGet: [
        keyValidator
    ],
    propertySet: [
        keyValidator,
        body().isString().withMessage("Body must be a string")
    ],
    propertyDelete: [
        keyValidator
    ]
}