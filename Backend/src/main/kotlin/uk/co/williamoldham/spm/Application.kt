package uk.co.williamoldham.spm

import io.github.cdimascio.dotenv.dotenv
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import uk.co.williamoldham.spm.db.setupPostgres
import uk.co.williamoldham.spm.plugins.configureHTTP
import uk.co.williamoldham.spm.plugins.configureMonitoring
import uk.co.williamoldham.spm.plugins.configureRouting
import uk.co.williamoldham.spm.plugins.configureSecurity
import uk.co.williamoldham.spm.plugins.configureSerialization

fun main() {

    val dotenv = dotenv {
        ignoreIfMissing = true
    }

//    val database = setupPostgres(dotenv)

    val port: Int = dotenv.get("PORT")?.toIntOrNull() ?: 8080

    embeddedServer(Netty, port = port, host = "0.0.0.0") {
        configureRouting()
        configureSecurity()
        configureHTTP()
        configureMonitoring()
        configureSerialization()
    }.start(wait = true)
}
