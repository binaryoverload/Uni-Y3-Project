const { body } = require("express-validator")

module.exports = {
    login: [
        body("username", "The username is required").exists().isString(),
        body("password", "The password is required").exists().isString().trim()
    ],
    refresh: [
        body("refresh_token", "Refresh token as a JWT is required").exists().isJWT()
    ]
}

