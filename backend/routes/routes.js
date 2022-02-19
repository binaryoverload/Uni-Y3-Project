const auth = require("./auth")
const user = require("./user")
const enrolmentToken = require("./enrolmentTokens")
const properties = require("./properties")
const files = require("./files")

module.exports = {
    setupRoutes (app) {
        app.use("/auth", auth)
        app.use("/users", user)
        app.use("/enrolment-tokens", enrolmentToken)
        app.use("/properties", properties)
        app.use("/files", files)
    }
}
