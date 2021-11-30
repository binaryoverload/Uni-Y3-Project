const express = require("express")
const cors = require("cors")

const config = require("./config")
const { logger, expressLogger } = require("./logger")

const { respondError } = require("./utils/http")
const { setupRoutes } = require("./routes/routes")
const { internalError, notFound } = require("./middlewares/errors")

const app = express()

app.use(expressLogger)

app.use(cors())

app.use(express.json())

setupRoutes(app)

app.use(notFound)
app.use(internalError);

app.get("/", (req, res) => res.send("Hello world"))

app.listen(config.port, () => logger.info(`Server running on http://localhost:${config.port}/ in ${config.environment} mode`))