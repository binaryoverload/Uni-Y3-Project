const jwt = require("jsonwebtoken")

const config = require("./config")

const signAccessJwt = (username, revocationUUID) => {
    return signJwt({ username, revocation_uuid: revocationUUID, token_type: "access" }, config.jwt.accessValidDuration)
}

const signRefreshJwt = (username, revocationUUID) => {
    return signJwt({ username, revocation_uuid: revocationUUID, token_type: "refresh" }, config.jwt.refreshValidDuration)
}

const signJwt = (payload, validDuration) => {
    return jwt.sign(payload, config.jwt.secret, {
        algorithm: "HS256",
        expiresIn: validDuration
    })
}



module.exports = { signAccessJwt, signRefreshJwt }