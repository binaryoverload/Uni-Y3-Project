const dotenv = require("dotenv")
const { merge } = require("lodash")

// Loads .env file into process.env
dotenv.config()

const requiredEnv = ["JWT_SECRET"]

const missingEnv = requiredEnv.filter(env => typeof process.env[env] === "undefined")

if (missingEnv.length > 0) {
    console.error(`Missing environment variables: ${missingEnv.map(s => `"${s}"`).join(", ")}`)
    process.exit(1)
}

const defaultConfig = {
    port: 8080,
    jwt: {
        accessValidDuration: "30m",
        refreshValidDuration: "30d"
    },
    bcrypt: {
        cost: 12
    }
}

const envConfig = {
    port: process.env.PORT,
    jwt: {
        secret: process.env.JWT_SECRET,
        accessValidDuration: process.env.JWT_ACCESS_VALID_DURATION,
        refreshValidDuration: process.env.JWT_REFRESH_VALID_DURATION
    },
    bcrypt: {
        cost: process.env.BCRYPT_COST
    }
}

const mergedConfig = merge(defaultConfig, envConfig)

if (!(mergedConfig.jwt.secret && mergedConfig.jwt.secret.length >= 32)) {
    console.error("JWT Secret must be at least 32 characters long!")
    process.exit(1)
}

module.exports = mergedConfig