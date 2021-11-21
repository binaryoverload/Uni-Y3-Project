const {body} = require("express-validator")

module.exports = {
    login: [
        body("username", "The username is required").exists().isString(),
        body("password", "The password is required").exists().isString().trim()
    ],
    refresh: [
        body("username").exists().isLength({min: 1}),
        body("revocation_uuid").exists().isUUID("4"),
        body("token_type").equals("refresh")
    ]
}

