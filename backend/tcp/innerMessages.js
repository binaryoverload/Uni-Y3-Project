const { getEnrolmentTokenByToken } = require("../models/enrolmentTokens")
const { cli } = require("triple-beam/config")
const { createClient } = require("../models/clients")
const opCodes = {
    registerClient: 1,
    registeredClient: 2,
    error: 100
}

const opCodeDecodeFunctions = {
    [opCodes.registerClient]: decodeRegisterClient
}

const requiredKeys = {
    [opCodes.registerClient]: ["enrolment_token", "os_information", "mac_address", "name", "public_key"],
    [opCodes.registeredClient]: ["client_id"]
}

function checkRequiredKeys(opCode, data) {
    const keys = Object.keys(data)
    for (let key of requiredKeys[opCode]) {
        if (!(keys.includes(key))) {
            throw new Error(`Data missing key ${key}`)
        }
    }
}

function encodeTCPError(message) {
    return {
        op_code: opCodes.error,
        message
    }
}

function encodeRegisteredClient(clientId) {
    return {
        op_code: opCodes.registeredClient,
        client_id: clientId
    }
}

function decodeRegisterClient(data) {
    checkRequiredKeys(opCodes.registerClient, data)
    const { enrolment_token: enrolmentToken } = data

    const token = getEnrolmentTokenByToken(enrolmentToken)

    if (!token) {
        return encodeTCPError(`Enrolment token ${token} is invalid`)
    }

    createClient()

}

module.exports = { opCodes, encodeTCPError, opCodeDecodeFunctions }