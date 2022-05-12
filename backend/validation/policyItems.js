const { body, oneOf } = require("express-validator")

const fileTypeValidator = body("type", "The policy type is required")
    .exists()
    .trim()
    .equals("file")
    .withMessage("The policy ID must be file")
const fileType = [
    fileTypeValidator,
    body("data.file_id", "File ID is required").if(fileTypeValidator).bail().exists().trim().isUUID(4),
    body("data.destination", "File destination is required")
        .if(fileTypeValidator)
        .bail()
        .exists()
        .trim()
        .isLength({ min: 1 }),
    body("data.permissions", "File permissions is required").if(fileTypeValidator).bail().exists().trim().isOctal(),
]

const packageTypeValidator = body("type", "The policy type is required")
    .exists()
    .trim()
    .equals("package")
    .withMessage("The policy ID must be package")
const packageType = [
    packageTypeValidator,
    body("data.action", "Package action is required")
        .if(packageTypeValidator)
        .bail()
        .exists()
        .trim()
        .isIn(["install", "uninstall"]),
    body("data.packages", "Packages are required")
        .if(packageTypeValidator)
        .bail()
        .exists()
        .isArray({ min: 1 })
        .withMessage("Must contain at least 1 package"),
    body("data.packages.*", "Packages must be a slug of at most 50 characters")
        .if(packageTypeValidator)
        .bail()
        .trim()
        .isLength({ min: 1, max: 50 }),
]

const commandTypeValidator = body("type", "The policy type is required")
    .exists()
    .trim()
    .equals("command")
    .withMessage("The policy ID must be a command")
const commandType = [
    commandTypeValidator,
    body("data.command", "Command is required").if(commandTypeValidator).bail().exists().trim().isLength({ min: 1 }),
    body("data.args", "Command arguments is required").if(commandTypeValidator).bail().exists().isArray(),
    body("data.working_directory")
        .if(commandTypeValidator)
        .bail()
        .optional({ nullable: true })
        .isString()
        .isLength({ min: 1 }),
    body("data.env").if(commandTypeValidator).bail().optional({ nullable: true }).isObject({ strict: true }),
]

module.exports = {
    policyItemCreate: [
        body("policy_id", "Policy ID must exist!").exists().trim().isUUID(4).withMessage("Policy ID must be a UUID v4"),
        oneOf([fileType, packageType, commandType]),
    ],
}
