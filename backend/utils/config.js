const dotenv = require("dotenv")
const validator = require("validator")
const { merge } = require("lodash")
const tripleBeam = require("triple-beam")

const exitCodes = require("./exitCodes")

// Loads .env file into process.env
dotenv.config()

const requiredEnv = ["JWT_SECRET", "POSTGRES_HOST", "POSTGRES_PASSWORD"]

const missingEnv = requiredEnv.filter(env => typeof process.env[env] === "undefined")

if (missingEnv.length > 0) {
    console.error(`Missing environment variables: ${missingEnv.map(s => `"${s}"`).join(", ")}`)
    process.exit(exitCodes.configMissingEnv)
}

const defaultConfig = {
    environment: "production",
    port: 8080,
    jwt: {
        accessValidDuration: "30m",
        refreshValidDuration: "30d"
    },
    loggingLevel: "info",
    passwordHashing: {
        timeCost: 3,
        memoryCost: 4096,
        parallelism: 1
    },
    postgres: {
        db: "postgres",
        user: "postgres",
        port: 5432
    }
}

const envConfig = {
    environment: process.env.NODE_ENV.toLowerCase(),
    port: process.env.PORT,
    jwt: {
        secret: process.env.JWT_SECRET,
        accessValidDuration: process.env.JWT_ACCESS_VALID_DURATION,
        refreshValidDuration: process.env.JWT_REFRESH_VALID_DURATION
    },
    loggingLevel: process.env.LOGGING_LEVEL?.toLowerCase(),
    passwordHashing: {
        timeCost: process.env.PASSWORD_TIME_COST,
        memoryCost: process.env.PASSWORD_MEMORY_COST,
        parallelism: process.env.PASSWORD_PARALLELISM
    },
    postgres: {
        db: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT
    }
}

const mergedConfig = merge(defaultConfig, envConfig)

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

module.exports = mergedConfig