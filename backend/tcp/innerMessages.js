const { getEnrolmentTokenByToken, updateEnrolmentToken } = require("../models/enrolmentTokens")
const { cli } = require("triple-beam/config")
const { createClient, getClientByPublicKey } = require("../models/clients")
const { splitHostAddress } = require("../utils/misc")
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

async function decodeRegisterClient(hostAddress, data) {
    checkRequiredKeys(opCodes.registerClient, data)
    const { enrolment_token: enrolmentToken, public_key: publicKey } = data

    const token = await getEnrolmentTokenByToken(enrolmentToken)

    if (!token) {
        return encodeTCPError(`Enrolment token ${token} is invalid`)
    }

    if (token.usage_limit && token.usage_current >= token.usage_limit) {
        return encodeTCPError("Enrolment token has reached the max usage limit")
    }

    if (token.expires_at >= new Date()) {
        return encodeTCPError("Enrolment token has expired")
    }

    // We now have a valid token

    let client = await getClientByPublicKey(publicKey)

    // If client already exists, we don't want to recreate!
    if (client) {
        return encodeTCPError("Client already registered")
    }

    const { ip } = splitHostAddress(hostAddress)

    data = {
        ...data,
        last_known_ip: ip,
        last_known_hostname: data.os_information?.Hostname
    }

    client = await createClient(data)

    await updateEnrolmentToken(token.id, {
        usage_current: token.usage_current + 1
    })

    return encodeRegisteredClient(client.id)
}

module.exports = { opCodes, encodeTCPError, opCodeDecodeFunctions }