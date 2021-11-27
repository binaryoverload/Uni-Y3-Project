const express = require("express")
const morgan = require("morgan")

const config = require("./config")
const logger = require("./logger")

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

app.listen(config.port, () => logger.info(`Server running on http://localhost:${config.port}/ in ${config.environment} mode`))