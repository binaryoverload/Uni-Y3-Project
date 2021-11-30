const auth = require("./auth")

module.exports = {
    setupRoutes (app) {
        app.use("/auth", auth)
        app.get("/user", (req, res) => {
            res.send("Hi!")
        })
    }
}
