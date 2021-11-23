const express = require("express")
const config = require("./config")
const morgan = require("morgan")

const { respondError } = require("./utils/http")
const { setupRoutes } = require("./routes/routes")

const app = express()

app.use(express.json())
app.use(morgan("dev"))

app.use((err, req, res, next) => {

    console.error(`Error 500: ${err.message}`)
    respondError(res, err.message, { stack: err.stack })

});

setupRoutes(app)

app.get("/", (req, res) => res.send("Hello world"))

app.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}/`))