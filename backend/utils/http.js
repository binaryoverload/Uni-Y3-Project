const { validationResult } = require("express-validator")
const { DuplicateEntityError, HttpError } = require("../utils/exceptions")
const { NotFoundError } = require("./exceptions")

/*
 *  Using https://github.com/omniti-labs/jsend for all responses
 */

const respondSuccess = (res, status, data) => {
    res.status(status).send({
        status: "success",
        data: data || null
    })
}

const respondFail = (res, status, data = null) => {
    res.status(status).send({
        status: "fail",
        data: data
    })
}

const respondError = (res, message, data) => {
    res.status(500).send({
        status: "error",
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

const checkValidationErrors = (validator) => {
    const validationCheck = (req, res, next) => {
        const errors = validationResult(req).array({ onlyFirstError: true })

        if (errors.length === 0) {
            next()
            return
        }

        const dataErrors = validationErrorsToJsend(errors)

        respondFail(res, 400, { code: "validation", ...dataErrors })
    }

    return [
        ...validator,
        validationCheck
    ]
}

function executeQuery (callback) {
    return async (req, res) => {
        let returnValue
        try {
            returnValue = callback({
                body: req.body,
                params: req.params,
                user: req.user,
                req: req,
                res: res
            })

            if (returnValue instanceof Promise) {
                returnValue = await returnValue
            }
            if (returnValue instanceof Error) {
                throw returnValue
            }
            if (!returnValue) {
                throw new NotFoundError()
            }
        } catch (err) {
            if (err instanceof DuplicateEntityError) {
                return respondFail(res, 400, {
                    code: "duplicate"
                })
            }
            if (err instanceof HttpError) {
                return respondFail(res, err.status, {
                    code: err.code
                })
            }
            throw err
        }
        respondSuccess(res, 200, returnValue)
    }
}

const respondToJwtError = (res, err) => {

    let code = "jwt_general"
    if (err.constructor.name === "TokenExpiredError") {
        code = "jwt_expired"
    }

    respondFail(res, 401, {
        code,
        "message": `JWT: ${err.message}`
    })
}

module.exports = { respondSuccess, respondFail, respondError, checkValidationErrors, respondToJwtError, executeQuery }