const { body } = require("express-validator")
const { idParamValidator } = require("./common")

module.exports = {
    userPost: [
        body("username", "The username is required")
            .exists()
            .isString()
            .trim()
            .isLength({ min: 1 })
            .withMessage("The username must be at least 1 character long"),
        body("password", "The password is required")
            .exists()
            .isString()
            .trim()
            .isLength({ min: 1 })
            .withMessage("The password must be at least 1 character long"),
        body("first_name", "The first name is required")
            .exists()
            .isString()
            .trim()
            .isLength({ min: 1 })
            .withMessage("The first name must be at least 1 character long"),
        body("last_name", "The last name is required")
            .exists()
            .isString()
            .trim()
            .isLength({ min: 1 })
            .withMessage("The last name must be at least 1 character long"),
    ],
    userPatch: [
        ...idParamValidator,
        body("username", "The username must be a string")
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1 })
            .withMessage("The username must be at least 1 character long"),
        body("password", "The password must be a string")
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1 })
            .withMessage("The password must be at least 1 character long"),
        body("first_name", "The first name must be a string")
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1 })
            .withMessage("The first name must be at least 1 character long"),
        body("last_name", "The last name must be a string")
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1 })
            .withMessage("The last name must be at least 1 character long"),
    ],
}
