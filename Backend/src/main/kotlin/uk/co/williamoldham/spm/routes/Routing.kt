package uk.co.williamoldham.spm.routes

import io.ktor.application.Application
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.features.StatusPages
import io.ktor.http.HttpStatusCode
import io.ktor.locations.Locations
import io.ktor.response.respond
import io.ktor.routing.routing

fun Application.configureRouting() {
    install(Locations)

    install(StatusPages) {
        exception<AuthenticationException> {
            call.respond(HttpStatusCode.Unauthorized)
        }
        exception<AuthorizationException> {
            call.respond(HttpStatusCode.Forbidden)
        }
    }

    routing {
        authRoutes()
    }
}

class AuthenticationException : RuntimeException()
class AuthorizationException : RuntimeException()
