const { body, param } = require("express-validator")
const { idParamValidator } = require("./common")

module.exports = {
    clientPatch: [
        idParamValidator,
        // TODO
    ],
}
