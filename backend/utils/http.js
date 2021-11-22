const { validationResult } = require("express-validator")

/*
 *  Using https://github.com/omniti-labs/jsend for all responses
 */

const respondSuccess = (res, status, data) => {
    res.status(status).send({
        status: "success",
        data: data || null
    })
}

const respondFail = (res, status, data) => {
    res.status(status).send({
        status: "fail",
        data: data || null
    })
}

const respondError = (res, message, data) => {
    res.status(500).send({
        message,
        data
    })
}

const validationErrorsToJsend = (errors) => {
    const finalObject = {}

    for (let error of errors) {
        if (!(error.param && error.msg)) continue
        finalObject[error.param] = error.msg
    }

    return finalObject
}

const checkValidationErrors = (req, res) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    if (errors.length === 0) {
        return
    }

    const dataErrors = validationErrorsToJsend(errors)

    respondFail(res, 400, dataErrors)
}

module.exports = { respondSuccess, respondFail, respondError, checkValidationErrors }