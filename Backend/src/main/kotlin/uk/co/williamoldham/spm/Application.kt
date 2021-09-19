package uk.co.williamoldham.spm

import io.github.cdimascio.dotenv.dotenv
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import uk.co.williamoldham.spm.db.databaseInitialise
import uk.co.williamoldham.spm.db.setupPostgres
import uk.co.williamoldham.spm.plugins.configureHTTP
import uk.co.williamoldham.spm.plugins.configureMonitoring
import uk.co.williamoldham.spm.plugins.configureSecurity
import uk.co.williamoldham.spm.plugins.configureSerialization
import uk.co.williamoldham.spm.routes.configureRouting

class Config(
    val host: String,
    val port: Int,
    val defaultAdminPassword: String,
    val jwtConfig: JwtConfig,
    val bcryptConfig: BcryptConfig
)

class JwtConfig(val secret: String, val accessValidDuration: Long, val refreshValidDuration: Long)

class BcryptConfig(val cost: Int)


val dotenv = dotenv {
    ignoreIfMissing = true
}

val config = createConfig()
val database = setupPostgres(dotenv)

fun createConfig(): Config {

    val port: Int = dotenv.get("PORT")?.toIntOrNull() ?: 8080
    val host = dotenv.get("HOST") ?: "0.0.0.0"
    val defaultAdminPassword = dotenv.get("DEFAULT_ADMIN_PASS") ?: "admin"

    require(dotenv.get("JWT_SECRET") != null) { "JWT_SECRET is required!" }
    require(dotenv.get("JWT_SECRET").length > 32) { "JWT_SECRET must be at least 32 character in length" }

    return Config(
        host,
        port,
        defaultAdminPassword,
        JwtConfig(
            dotenv.get("JWT_SECRET"),
            (dotenv.get("JWT_ACCESS_VALID_DURATION")?.toULongOrNull() ?: (60UL * 30U)).toLong(),
            (dotenv.get("JWT_REFRESH_VALID_DURATION")?.toULongOrNull() ?: (60UL * 60U * 24U * 30U)).toLong()
        ),
        BcryptConfig(
            dotenv.get("BCRYPT_COST")?.toIntOrNull() ?: 12
        )
    )
}

fun main() {


    databaseInitialise(config)

    embeddedServer(Netty, port = config.port, host = config.host) {
        configureHTTP()
        configureSecurity()
        configureRouting()
        configureMonitoring()
        configureSerialization()
    }.start(wait = true)
}