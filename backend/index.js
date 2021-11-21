const express = require("express")
const config = require("./config")
const morgan = require("morgan")

const { setupRoutes } = require("./routes/routes")

const app = express()

app.use(express.json())
app.use(morgan("dev"))

setupRoutes(app)

app.get("/", (req, res) => res.send("Hello world"))

app.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}/`))