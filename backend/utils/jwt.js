const jwt = require("jsonwebtoken")

const config = require("./config")

const signAccessJwt = (username, checksum) => {
    return signJwt({ username, checksum, token_type: "access" }, config.jwt.accessValidDuration)
}

const signRefreshJwt = (username, checksum) => {
    return signJwt({ username, checksum, token_type: "refresh" }, config.jwt.refreshValidDuration)
}

const signJwt = (payload, validDuration) => {
    return jwt.sign(payload, config.jwt.secret, {
        algorithm: "HS256",
        expiresIn: validDuration,
    })
}

module.exports = { signAccessJwt, signRefreshJwt }
