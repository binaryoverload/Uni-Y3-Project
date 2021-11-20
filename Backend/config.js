const dotenv = require("dotenv")

// Loads .env file into process.env
dotenv.config()

module.exports = {
    port: process.env.PORT || 8080
}