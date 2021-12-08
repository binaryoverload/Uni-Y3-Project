const crypto = require("crypto")

/*
 Produces a 16 character code that will be used to enrol client devices.

 To ensure device cannot be enrolled by anyone, a random token is produced which consists of 8 random bytes
 generated using a CSRNG.
 */
function generateToken() {
    return crypto.randomBytes(8).toString("hex")
}

module.exports = { generateToken }