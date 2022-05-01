const { body, param, oneOf } = require("express-validator")

const fileType = [
    body("type", "The policy type is required")
        .exists()
        .trim()
        .equals("file")
        .withMessage("The policy ID must be file"),
    body("data.file_id", "File ID is required").exists().trim().isUUID(4),
    body("data.destination", "File destination is required").exists().trim().isLength({ min: 1 }),
    body("data.permissions", "File permissions is required").exists().trim().isOctal(),
]

const packageType = [
    body("type", "The policy type is required")
        .exists()
        .trim()
        .equals("package")
        .withMessage("The policy ID must be package"),
    body("data.action", "Package action is required").exists().trim().isIn(["install", "uninstall"]),
    body("data.packages", "Packages are required")
        .exists()
        .isArray({ min: 1 })
        .withMessage("Must contain at least 1 package"),
]

const commandType = [
    body("type", "The policy type is required")
        .exists()
        .trim()
        .equals("command")
        .withMessage("The policy ID must be a command"),
    body("data.command", "Command is required").exists().trim().isLength({ min: 1 }),
    body("data.args", "Command arguments is required").exists().isArray(),
    body("data.working_directory").optional({ nullable: true }).isString().isLength({ min: 1 }),
    body("data.env").optional({ nullable: true }).isObject({ strict: true }),
]

module.exports = {
    policyItemCreate: [
        body("policy_id", "Policy ID must exist!").exists().trim().isUUID(4).withMessage("Policy ID must be a UUID v4"),
        oneOf([fileType, packageType, commandType]),
    ],
}
