const { getEnrolmentTokenByToken, updateEnrolmentToken } = require("../models/enrolmentTokens")
const { cli } = require("triple-beam/config")
const { createClient, getClientByPublicKey, getClientById, updateClient } = require("../models/clients")
const { splitHostAddress } = require("../utils/misc")
const opCodes = {
    heartbeat: 1,
    heartbeatAck: 2,
    registerClient: 5,
    registerClientAck: 6,
    invalidClient: 99,
    error: 100
}

const opCodeDecodeFunctions = {
    [opCodes.heartbeat]: decodeHeartbeat,
    [opCodes.registerClient]: decodeRegisterClient
}

const requiredKeys = {
    [opCodes.registerClient]: ["enrolment_token"/*, "os_information", "mac_address"*/, "name", "public_key"],
    [opCodes.registerClientAck]: ["client_id"]
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

function encodeRegisterClientAck(clientId) {
    return {
        op_code: opCodes.registerClientAck,
        client_id: clientId
    }
}

function encodeHeartbeatAck() {
    return {
        op_code: opCodes.heartbeatAck
    }
}

function encodeInvalidClient() {
    return {
        op_code: opCodes.invalidClient
    }
}

async function decodeRegisterClient(ctx, data) {
    checkRequiredKeys(opCodes.registerClient, data)
    const { enrolment_token: enrolmentToken, public_key: publicKey } = data

    const token = await getEnrolmentTokenByToken(enrolmentToken)

    if (!token) {
        return encodeTCPError(`Enrolment token ${token} is invalid`)
    }

    if (token.usage_limit && token.usage_current >= token.usage_limit) {
        return encodeTCPError("Enrolment token has reached the max usage limit")
    }

    if (token.expires_at && token.expires_at <= new Date()) {
        return encodeTCPError("Enrolment token has expired")
    }

    // We now have a valid token

    let client = await getClientByPublicKey(publicKey)

    // If client already exists, we don't want to recreate!
    if (client) {
        return encodeTCPError("Client already registered")
    }

    const { ip } = splitHostAddress(ctx.hostAddress)

    data = {
        ...data,
        last_known_ip: ip,
        last_known_hostname: data.os_information?.Hostname
    }

    client = await createClient(data)

    await updateEnrolmentToken(token.id, {
        usage_current: token.usage_current + 1
    })

    return encodeRegisterClientAck(client.id)
}

async function decodeHeartbeat(ctx, data) {
    const { os_information, mac_address } = data

    const client = await getClientById(ctx.clientId)

    if (!client) {
        return encodeInvalidClient()
    }

    const { ip } = splitHostAddress(ctx.hostAddress)

    const updateData = {
        last_known_ip: ip,
        last_known_hostname: os_information?.Hostname,
        mac_address,
        os_information,
        last_activity: new Date()
    }

    await updateClient(client.id, updateData)

    return encodeHeartbeatAck()
}

module.exports = { opCodes, encodeTCPError, opCodeDecodeFunctions }