const express = require("express")
const config = require("./config")

const { setupRoutes } = require("./routes/routes")

const app = express()

setupRoutes(app)

app.get("/", (req, res) => res.send("Hello world"))

app.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}/`))