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
            .isLength({ min: 1, max: 100 })
            .withMessage("Token name must be between 1 and 100 characters long")
            .isString(),
    ],
}
