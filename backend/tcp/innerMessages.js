const { getEnrolmentTokenByToken, updateEnrolmentToken } = require("../models/enrolmentTokens")
const { cli } = require("triple-beam/config")
const Cache = require("node-cache")

const fs = require("fs")
const fsPromise = require("fs/promises")

const crc32 = require("crc-32")

const { createClient, getClientByPublicKey, getClientById, updateClient } = require("../models/clients")
const { getAllPolicyItems } = require("../models/policyItems")
const { getAllPolicies } = require("../models/policies")
const { getFileById } = require("../models/files")
const path = require("path")
const config = require("../utils/config")
const FS = require("fs")
const opCodes = {
    heartbeat: 1,
    heartbeatAck: 2,
    registerClient: 5,
    registerClientAck: 6,
    reqFileInfo: 7,
    resFileInfo: 8,
    reqFileChunk: 9,
    resFileChunk: 10,
    invalidClient: 99,
    error: 100,
}

const opCodeDecodeFunctions = {
    [opCodes.heartbeat]: decodeHeartbeat,
    [opCodes.registerClient]: decodeRegisterClient,
    [opCodes.reqFileInfo]: decodeFileInfoRequest,
    [opCodes.reqFileChunk]: decodeFileChunkRequest,
}

const requiredKeys = {
    [opCodes.registerClient]: ["enrolment_token" /*, "os_information", "mac_address"*/, "name", "public_key"],
    [opCodes.registerClientAck]: ["client_id"],
}

function checkRequiredKeys(opCode, data) {
    const keys = Object.keys(data)
    for (let key of requiredKeys[opCode]) {
        if (!keys.includes(key)) {
            throw new Error(`Data missing key ${key}`)
        }
    }
}

function encodeTCPError(message) {
    return {
        op_code: opCodes.error,
        message,
    }
}

function encodeRegisterClientAck(clientId) {
    return {
        op_code: opCodes.registerClientAck,
        client_id: clientId,
    }
}

function encodeHeartbeatAck(policies) {
    return {
        op_code: opCodes.heartbeatAck,
        policies,
    }
}

function encodeInvalidClient() {
    return {
        op_code: opCodes.invalidClient,
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

    const { ip } = ctx.hostAddress

    data = {
        ...data,
        last_known_ip: ip,
        last_known_hostname: data.os_information?.Hostname,
    }

    client = await createClient(data)

    await updateEnrolmentToken(token.id, {
        usage_current: token.usage_current + 1,
    })

    return encodeRegisterClientAck(client.id)
}

const policyCache = new Cache({
    stdTTL: 60,
})

async function decodeHeartbeat(ctx, data) {
    const { os_information, mac_address } = data

    const client = await getClientById(ctx.clientId)

    if (!client) {
        return encodeInvalidClient()
    }

    const updateData = {
        last_known_ip: ctx.hostAddress.ip,
        last_known_hostname: os_information?.Hostname,
        mac_address,
        os_information,
        last_activity: new Date(),
    }

    await updateClient(client.id, updateData)

    if (!policyCache.has("policies") || process.env.NODE_ENV === "development") {
        const policies = await getAllPolicies()
        policyCache.set("policies", policies)
    }

    return encodeHeartbeatAck(policyCache.get("policies"))
}

async function decodeFileChunkRequest(ctx, data) {
    const { file_id: fileId, chunk_number: chunkNumber } = data

    if (chunkNumber < 0) {
        return encodeTCPError("Requested chunk must be 0 minimum")
    }

    const file = await getFileById(fileId)

    if (!file) {
        return encodeTCPError("fileId does not exist")
    }

    const fileChunks = Math.ceil(file.size / config.files.chunkSize)

    if (chunkNumber >= fileChunks) {
        return encodeTCPError("Requested chunk exceeds number of chunks in file")
    }

    try {
        const fd = await fsPromise.open(path.join(config.files.uploadDirectory, fileId), "r")

        const { size: statsSize } = await fd.stat()

        if (statsSize !== file.size) {
            return encodeTCPError("Requested file has been modified on disk")
        }

        const start = chunkNumber * config.files.chunkSize
        const length = Math.min(file.size - start, config.files.chunkSize)

        const fileBuffer = Buffer.alloc(length)

        await fd.read(fileBuffer, 0, length, start)

        const opCode = Buffer.alloc(1)
        opCode.writeUInt8(opCodes.resFileChunk)

        return Buffer.concat([opCode, fileBuffer])
    } catch (e) {
        return encodeTCPError("Error sending file: " + e.message)
    }
}

function encodeFileInfoRes(data) {
    return {
        op_code: opCodes.resFileInfo,
        ...data,
    }
}

async function decodeFileInfoRequest(ctx, data) {
    const { file_id } = data

    const file = await getFileById(file_id)

    if (!file) {
        return encodeTCPError("could not find file with that id")
    }

    const fileChunks = Math.ceil(file.size / config.files.chunkSize)

    return encodeFileInfoRes({
        file_id: file.id,
        filename: file.original_filename,
        num_chunks: fileChunks,
        hash: file.hash,
        total_size: file.size,
    })
}

module.exports = { opCodes, encodeTCPError, opCodeDecodeFunctions }
