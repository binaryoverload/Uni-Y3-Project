const { param } = require("express-validator")

const idParamValidator = param("id", "ID is required").exists().isUUID(4).withMessage("ID must be a UUID v4")

module.exports = {
    idParamValidator,
}
