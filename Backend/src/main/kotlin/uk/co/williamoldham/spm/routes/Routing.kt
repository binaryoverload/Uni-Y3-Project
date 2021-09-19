package uk.co.williamoldham.spm.routes

import io.ktor.application.Application
import io.ktor.application.ApplicationCall
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
        exception<UnauthorisedException> { cause ->
            responseToException(call, HttpStatusCode.Unauthorized, cause.message)
        }
        exception<ForbiddenException> { cause ->
            responseToException(call, HttpStatusCode.Forbidden, cause.message)
        }
    }

    routing {
        authRoutes()
    }
}

suspend fun responseToException(call: ApplicationCall, statusCode: HttpStatusCode, message: String?) {
    if (message == null) {
        call.respond(statusCode)
    } else {
        call.respond(statusCode, message)
    }
}

class UnauthorisedException(override val message: String? = null) : RuntimeException()
class ForbiddenException(override val message: String? = null) : RuntimeException()
