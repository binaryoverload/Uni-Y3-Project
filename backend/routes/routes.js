const auth = require("./auth")
const user = require("./user")
const enrolmentToken = require("./enrolmentTokens")

module.exports = {
    setupRoutes (app) {
        app.use("/auth", auth)
        app.use("/users", user)
        app.use("/enrolment-tokens", enrolmentToken)
    }
}
