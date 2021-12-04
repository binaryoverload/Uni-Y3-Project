const { respondFail, respondError } = require("../utils/http")
const config = require("../utils/config")
const { logger } = require("../utils/logger")
const { DatabaseError } = require("../utils/exceptions")

const notFound = (req, res, next) => {
    return respondFail(res, 404, { message: "Not found!" })
}

const internalError = (err, req, res, next) => {
    if (config.environment !== "development") {
        delete err.stack
    }

    let label = null
    if (err instanceof DatabaseError)
        label = "postgres"

    logger.error(`Error 500: ${err.message}`, { label })
    respondError(res, err.message, { ...err })
}

module.exports = { notFound, internalError }