const { respondFail, respondError, handleRequestError } = require("../utils/http")
const config = require("../utils/config")
const { logger } = require("../utils/logger")
const { DatabaseError } = require("../utils/httpExceptions")
const { handleError } = require("pg/lib/native/query")

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

    try {
        return handleRequestError(err, res)
    } catch (unknownError) {
        respondError(res, unknownError.message, { ...unknownError })
    }
}

module.exports = { notFound, internalError }