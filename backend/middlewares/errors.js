const { respondFail, respondError } = require("../utils/http")
const config = require("../config")

const notFound = (req, res, next) => {
    return respondFail(res, 404, { message: "Not found!" })
}

const internalError = (err, req, res, next) => {
    if (config.environment !== "development") {
        delete err.stack
    }

    console.error(`Error 500: ${err.message}`)
    respondError(res, err.message, { ...err })
}

module.exports = { notFound, internalError }