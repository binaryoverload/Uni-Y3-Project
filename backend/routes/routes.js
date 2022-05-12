const auth = require("./auth")
const user = require("./user")
const enrolmentToken = require("./enrolmentTokens")
const properties = require("./properties")
const files = require("./files")
const clients = require("./clients")
const policies = require("./policies")
const policyItems = require("./policyItems")
const config = require("../utils/config")
const encryption = require("../utils/encryption")

const { validateJwt } = require("../middlewares/validateJwt")
const { executeQuery } = require("../utils/http")
const archiver = require("archiver")
const fs = require("fs")
const fsPromises = require("fs").promises
const path = require("path")
const { asyncFilter } = require("../utils/misc")
const stringReplaceStream = require("string-replace-stream")

module.exports = {
    setupRoutes(app) {
        app.use("/auth", auth)
        app.use("/users", user)
        app.use("/enrolment-tokens", enrolmentToken)
        app.use("/properties", properties)
        app.use("/files", files)
        app.use("/policies", policies)
        app.use("/policy-items", policyItems)
        app.use("/clients", clients)

        app.get(
            "/install-bundle/:token",
            validateJwt,
            executeQuery(async ({ res, params }) => {
                const zip = archiver("zip", {})

                zip.pipe(res)

                const baseDir = "./install-bundle"

                const files = await fsPromises.readdir(baseDir).then(function (files) {
                    return asyncFilter(files, async file => {
                        return (await fsPromises.stat(path.join(baseDir, file))).isFile()
                    })
                })

                const clientSettings = {
                    server_public_key: encryption.ecPublicKeyHex,
                    server_host: config.externalHostname,
                    server_port: config.ports.tcp,
                    enrolment_token: params.token,
                }

                zip.append(JSON.stringify(clientSettings, null, 2), {
                    name: "client_settings.json",
                })

                for (let file of files) {
                    const baseName = path.basename(file)
                    const readStream = fs.createReadStream(path.join(baseDir, file))
                    zip.append(readStream, { name: baseName })
                }

                await zip.finalize()
            })
        )
    },
}
