const exitCodes = {
    postgresError: 10,
    configMissingEnv: 20,
    configInvalidJwtSecret: 21,
    configInvalidPostgres: 22,
    configPasswordHashing: 23,
    configEncryptionPrivateKey: 24,
    configEncryptionCurve: 25,
}

module.exports = exitCodes
