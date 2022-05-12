const { validationResult } = require("express-validator")
const { HttpError } = require("./httpExceptions")
const { NotFoundError, exceptionCodes, DatabaseDataError } = require("./httpExceptions")
const { JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken")

/*
 *  Using https://github.com/omniti-labs/jsend for all responses
 */

const respondSuccess = (res, status, data) => {
    res.status(status).send({
        status: "success",
        data: data || null,
    })
}

const respondFail = (res, status, data = null) => {
    res.status(status).send({
        status: "fail",
        data: data,
    })
}

const respondError = (res, message, data) => {
    res.status(500).send({
        status: "error",
        message,
        data,
    })
}

const validationErrorsToJsend = errors => {
    const finalObject = {}

    for (let error of errors) {
        if (error.nestedErrors) {
            for (let nestedError of error.nestedErrors) {
                if (!(nestedError.param && nestedError.msg)) continue
                finalObject[nestedError.param] = nestedError.msg
            }
            continue
        }
        if (!(error.param && error.msg)) continue
        finalObject[error.param] = error.msg
    }

    return finalObject
}

const checkValidationErrors = validator => {
    const validationCheck = (req, res, next) => {
        const errors = validationResult(req).array({ onlyFirstError: true })

        if (errors.length === 0) {
            next()
            return
        }

        const dataErrors = validationErrorsToJsend(errors)

        respondFail(res, 400, { code: exceptionCodes.validation, ...dataErrors })
    }

    return [...validator, validationCheck]
}

function handleRequestError(err, res) {
    if (err instanceof DatabaseDataError) {
        return respondFail(res, 400, {
            code: err.code,
            message: err.message,
        })
    }
    if (err instanceof HttpError) {
        return respondFail(res, err.status, {
            code: err.code,
        })
    }
    if (err instanceof JsonWebTokenError) {
        const code = err instanceof TokenExpiredError ? exceptionCodes.jwtExpired : exceptionCodes.jwtGeneral
        return respondFail(res, 401, {
            code,
            message: `JWT: ${err.message}`,
        })
    }
    throw err
}

function executeQuery(callback) {
    return async (req, res) => {
        let returnValue
        try {
            returnValue = callback({
                body: req.body,
                query: req.query,
                params: req.params,
                user: req.user,
                req: req,
                res: res,
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
            return handleRequestError(err, res)
        }
        respondSuccess(res, 200, returnValue)
    }
}

module.exports = { respondSuccess, respondFail, respondError, checkValidationErrors, executeQuery, handleRequestError }
