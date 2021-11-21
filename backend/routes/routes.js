const auth = require("./auth")

module.exports = {
    setupRoutes (app) {
        app.use("/auth", auth)
    }
}
