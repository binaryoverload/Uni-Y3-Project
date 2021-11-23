const express = require("express")
const config = require("./config")
const morgan = require("morgan")

const { respondError } = require("./utils/http")
const { setupRoutes } = require("./routes/routes")
const { internalError, notFound } = require("./middlewares/errors")

const app = express()

app.use(express.json())
app.use(morgan("dev"))

setupRoutes(app)

app.use(notFound)
app.use(internalError);

app.get("/", (req, res) => res.send("Hello world"))

app.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}/ in ${config.environment} mode`))