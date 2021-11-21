const jwt = require("jsonwebtoken")

const config = require("../config")

const signAccessJwt = (username, revocationUUID) => {
    signJwt({username, revocationUUID}, config.jwt.accessValidDuration)
};

const signRefreshJwt = (username, revocationUUID) => {
    signJwt({username, revocationUUID}, config.jwt.accessValidDuration)
}

const signJwt = (payload, validDuration) => {
    return jwt.sign(payload, config.jwt.secret, {
        algorithm: "HS256",
        expiresIn: validDuration
    })
}

module.exports = { signAccessJwt, signRefreshJwt }