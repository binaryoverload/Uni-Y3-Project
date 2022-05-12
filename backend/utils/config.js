const dotenv = require("dotenv")
const validator = require("validator")
const { merge } = require("lodash")
const tripleBeam = require("triple-beam")
const { getCurves } = require("crypto")

const exitCodes = require("./exitCodes")

// Loads .env file into process.env
dotenv.config()

const requiredEnv = ["JWT_SECRET", "POSTGRES_HOST", "POSTGRES_PASSWORD", "EC_PRIVATE_KEY"]

const missingEnv = requiredEnv.filter(env => typeof process.env[env] === "undefined")

if (missingEnv.length > 0) {
    console.error(`Missing environment variables: ${missingEnv.map(s => `"${s}"`).join(", ")}`)
    process.exit(exitCodes.configMissingEnv)
}

const defaultConfig = {
    environment: "production",
    ports: {
        http: 8080,
        tcp: 9000
    },
    externalHostname: "",
    jwt: {
        accessValidDuration: "30m",
        refreshValidDuration: "30d",
    },
    loggingLevel: "info",
    passwordHashing: {
        timeCost: 3,
        memoryCost: 4096,
        parallelism: 1,
    },
    files: {
        sizeLimit: 100 * 1024 * 1024, // 100MiB
        chunkSize: 10 * 1024 * 1024,
        uploadDirectory: "./uploads/",
    },
    encryption: {
        ecCurve: "prime256v1",
        aesAlgorithm: "aes-256-gcm",
    },
    postgres: {
        db: "postgres",
        user: "postgres",
        port: 5432,
    },
}

const envConfig = {
    environment: process.env.NODE_ENV?.toLowerCase(),
    ports: {
        http: process.env.PORT,
        tcp: process.env.TCP_PORT
    },
    externalHostname: process.env.EXTERNAL_HOSTNAME,
    jwt: {
        secret: process.env.JWT_SECRET,
        accessValidDuration: process.env.JWT_ACCESS_VALID_DURATION,
        refreshValidDuration: process.env.JWT_REFRESH_VALID_DURATION,
    },
    loggingLevel: process.env.LOGGING_LEVEL?.toLowerCase(),
    passwordHashing: {
        timeCost: process.env.PASSWORD_TIME_COST,
        memoryCost: process.env.PASSWORD_MEMORY_COST,
        parallelism: process.env.PASSWORD_PARALLELISM,
    },
    files: {
        sizeLimit: process.env.UPLOADS_SIZE_LIMIT,
        chunkSize: process.env.FILE_CHUNK_SIZE,
        uploadDirectory: process.env.UPLOADS_DIRECTORY,
    },
    encryption: {
        ecCurve: process.env.EC_CURVE,
        ecPrivateKey: process.env.EC_PRIVATE_KEY,
    },
    postgres: {
        db: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
    },
}

const mergedConfig = merge(defaultConfig, envConfig)

if (!validator.isIP(mergedConfig.externalHostname) && !validator.isFQDN(mergedConfig.externalHostname, {require_tld: false})) {
    console.error("External URL must be provided")
    process.exit(exitCodes.configInvalidExternalHostname)
}

if (!validator.isLength(mergedConfig.jwt.secret, { min: 32, max: 64 })) {
    console.error("JWT Secret must be between 32 and 64 characters long!")
    process.exit(exitCodes.configInvalidJwtSecret)
}

if (!validator.isPort(String(mergedConfig.postgres.port))) {
    console.error("Postgres port must be a valid TCP/IP port!")
    process.exit(exitCodes.configInvalidPostgres)
}

const host = mergedConfig.postgres.host
if (!(validator.isFQDN(host, { require_tld: false }) || validator.isIP(host))) {
    console.error("Postgres host must be a valid hostname or IP!")
    process.exit(exitCodes.configInvalidPostgres)
}

const passwordHashing = mergedConfig.passwordHashing
if (Object.values(passwordHashing).some(param => !validator.isInt(String(param)))) {
    console.error("All password hashing parameters must be integers!")
    process.exit(exitCodes.configPasswordHashing)
}

if (Object.keys(tripleBeam.configs.npm.levels).indexOf(mergedConfig.loggingLevel) === -1) {
    console.warn("Logging level is not valid! Using INFO")
    mergedConfig.loggingLevel = "info"
}

if (!(mergedConfig.encryption.ecPrivateKey.length === 64)) {
    console.error("Elliptical curve private key must be 32 bytes in hex format (64 chars)")
    process.exit(exitCodes.configEncryptionPrivateKey)
}

if (!getCurves().includes(mergedConfig.encryption.ecCurve)) {
    console.error(
        `The elliptical curve "${mergedConfig.encryption.ecCurve}" is not supported! Please use crypto.getCurves() to find a supported curve. Default is "${defaultConfig.encryption.ecCurve}"`
    )
    process.exit(exitCodes.configEncryptionCurve)
}

module.exports = mergedConfig
