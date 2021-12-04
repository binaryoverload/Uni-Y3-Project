const auth = require("./auth")
const user = require("./user")

module.exports = {
    setupRoutes (app) {
        app.use("/auth", auth)
        app.use("/user", user)
    }
}
