const { body, param } = require("express-validator")
const { idParamValidator } = require("./common")

module.exports = {
    tokenUpdate: [
        ...idParamValidator,
        body("expires_at", "Expires at must be null or a epoch value").optional({ nullable: true }).isInt(),
        body("usage_limit", "Usage limit must be null or a epoch value").optional({ nullable: true }).isInt(),
    ],
    tokenCreate: [
        body("name", "Enrolment tokens must be provided with a name")
            .exists()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage("Token name must be between 1 and 100 characters long")
            .isString(),
        body("expires_at")
            .optional({ nullable: true, checkFalsy: true })
            .trim()
            .isISO8601({ strict: true, strictSeparator: true })
            .withMessage("Expires at must be a valid date"),
        body("usage_limit")
            .optional({ nullable: true })
            .trim()
            .isNumeric()
            .withMessage("Usage limit must be a number")
            .isInt({ min: 1 })
            .withMessage("Usage limit must be 1 or greater"),
    ],
}
