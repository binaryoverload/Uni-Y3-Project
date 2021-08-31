package uk.co.williamoldham.spm

import io.github.cdimascio.dotenv.dotenv
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import org.koin.core.context.startKoin
import org.koin.dsl.module
import uk.co.williamoldham.spm.db.databaseInitialise
import uk.co.williamoldham.spm.db.setupPostgres
import uk.co.williamoldham.spm.plugins.configureHTTP
import uk.co.williamoldham.spm.plugins.configureMonitoring
import uk.co.williamoldham.spm.plugins.configureRouting
import uk.co.williamoldham.spm.plugins.configureSecurity
import uk.co.williamoldham.spm.plugins.configureSerialization

class Config(val host: String, val port: Int, val jwtConfig: JwtConfig, val bcryptConfig: BcryptConfig)

class JwtConfig(val secret: String, val validDuration: Long)

class BcryptConfig(val cost: Int)


fun main() {

    val dotenv = dotenv {
        ignoreIfMissing = true
    }

    val port: Int = dotenv.get("PORT")?.toIntOrNull() ?: 8080
    val host = dotenv.get("HOST") ?: "0.0.0.0"

    require(dotenv.get("JWT_SECRET") != null) { "JWT_SECRET is required!" }
    require(dotenv.get("JWT_SECRET").length > 32) { "JWT_SECRET must be at least 32 character in length" }

    val config = Config(
        host,
        port,
        JwtConfig(
            dotenv.get("JWT_SECRET"),
            (dotenv.get("JWT_VALID_DURATION")?.toULongOrNull() ?: 86400U).toLong()
        ),
        BcryptConfig(
            dotenv.get("BCRYPT_COST")?.toIntOrNull() ?: 12
        )
    )

    val database = setupPostgres(dotenv)
    databaseInitialise(config)

    val koinModule = module {
        single { config }
        single { database }
    }

    startKoin {
        printLogger()
        modules(koinModule)
    }

    embeddedServer(Netty, port = port, host = "0.0.0.0") {
        configureHTTP()
        configureRouting()
        configureSecurity(config)
        configureMonitoring()
        configureSerialization()
    }.start(wait = true)
}
