package uk.co.williamoldham.spm.plugins

import com.example.plugins.UUIDSerializer
import io.ktor.auth.*
import io.ktor.util.*
import io.ktor.sessions.*
import io.ktor.application.*
import io.ktor.response.*
import io.ktor.request.*
import io.ktor.routing.*
import org.postgresql.gss.MakeGSS.authenticate
import java.util.UUID

class UserPrincipal(val username: String) : Principal

fun Application.configureSecurity() {

    install(Sessions) {
        cookie<UUID>("session") {
            serializer = UUIDSerializer()
        }
    }

    install(Authentication) {
        form("auth-form") {
            userParamName = "username"
            passwordParamName = "password"
            validate { credentials ->
                UserPrincipal(credentials.name)
            }
        }
        session<UUID>("auth-session") {
            validate { session ->
                UserPrincipal("session!")
            }
            challenge {
                call.respondRedirect("/goodbye")
            }
        }
    }

    routing {

        authenticate("auth-form") {
            post("/login") {
                val username = call.principal<UserPrincipal>()?.username
                call.sessions.set(UUID.randomUUID())
                call.respondRedirect("/hello")
            }
        }

        authenticate("auth-session") {
            get("/hello") {
                val userSession = call.principal<UserPrincipal>()
                call.respondText("Hello, ${call.sessions.get<UUID>()}!")
            }
        }

        get("/logout") {
            call.sessions.clear<UUID>()
        }

    }
}
