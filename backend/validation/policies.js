const { body, param } = require("express-validator")

module.exports = {
    policyCreate: [
        body("name", "The name is required")
            .exists()
            .isString()
            .trim()
            .isLength({ min: 1 })
            .withMessage("The name must be at least 1 character long"),
        body("description")
            .optional({ nullable: true, checkFalsy: true })
            .isString()
            .trim()
            .isLength({ min: 1 })
            .withMessage("The description must be at least 1 character long"),
        body("created_by", "created by Id must exist!")
            .exists().isUUID(4).withMessage("ID must be a UUID v4"),
    ],
}