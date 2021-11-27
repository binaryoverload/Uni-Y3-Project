const dotenv = require("dotenv")
const validator = require("validator")
const { merge } = require("lodash")

// Loads .env file into process.env
dotenv.config()

const requiredEnv = ["JWT_SECRET", "POSTGRES_HOST", "POSTGRES_PASSWORD"]

const missingEnv = requiredEnv.filter(env => typeof process.env[env] === "undefined")

if (missingEnv.length > 0) {
    console.error(`Missing environment variables: ${missingEnv.map(s => `"${s}"`).join(", ")}`)
    process.exit(1)
}

const defaultConfig = {
    environment: "production",
    port: 8080,
    jwt: {
        accessValidDuration: "30m",
        refreshValidDuration: "30d"
    },
    bcrypt: {
        cost: 12
    },
    postgres: {
        db: "postgres",
        user: "postgres",
        port: 5432
    }
}

const envConfig = {
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    jwt: {
        secret: process.env.JWT_SECRET,
        accessValidDuration: process.env.JWT_ACCESS_VALID_DURATION,
        refreshValidDuration: process.env.JWT_REFRESH_VALID_DURATION
    },
    bcrypt: {
        cost: process.env.BCRYPT_COST
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
    process.exit(1)
}

if (!validator.isPort(String(mergedConfig.postgres.port))) {
    console.error("Postgres port must be a valid TCP/IP port!")
    process.exit(1)
}

const host = mergedConfig.postgres.host
if (!(validator.isFQDN(host, { require_tld: false }) || validator.isIP(host))) {
    console.error("Postgres host must be a valid hostname or IP!")
    process.exit(1)
}

module.exports = mergedConfig