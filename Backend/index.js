const express = require("express")
const config = require("./config")

const { setupRoutes } = require("./routes/routes")

const app = express();

app.use(express.json());

setupRoutes(app)

app.get("/", (req, res) => res.send("Hello world"))

app.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}/`))