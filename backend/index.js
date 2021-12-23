const express = require("express")
require('express-async-errors')

const cors = require("cors")

const config = require("./utils/config")
const { logger, expressLogger } = require("./utils/logger")
const { pool, queryPool, verifyConnection: verifyPostgresConnection } = require("./setup/db")

const { respondError } = require("./utils/http")
const { setupRoutes } = require("./routes/routes")
const { internalError, notFound } = require("./middlewares/errors")
const { startTCPServer } = require("./tcp/server")

verifyPostgresConnection()

const app = express()

app.use(expressLogger)
app.use(cors())
app.use(express.json())

setupRoutes(app)

app.use(notFound)
app.use(internalError);

app.get("/", (req, res) => res.send("Hello world"))

startTCPServer()
app.listen(config.port, () => logger.info(`Server running on http://localhost:${config.port}/ in ${config.environment} mode`));

[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`].forEach((eventType) => {
    process.on(eventType, () => {
        pool.end()
    })
})