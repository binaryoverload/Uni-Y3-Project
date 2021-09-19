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
        exception<HTTPStatusException> { cause ->
            respondToException(call, cause)
        }
    }

    routing {
        authRoutes()
        userRoutes()
    }
}

suspend fun respondToException(call: ApplicationCall, exception: HTTPStatusException) {
    val message = exception.message
    if (message == null) {
        call.respond(exception.httpStatusCode)
    } else {
        call.respond(exception.httpStatusCode, message)
    }
}

sealed class HTTPStatusException(val httpStatusCode: HttpStatusCode, override val message: String? = null) : RuntimeException()

class UnauthorisedException(message: String? = null) : HTTPStatusException(HttpStatusCode.Unauthorized, message)
class ForbiddenException(message: String? = null) : HTTPStatusException(HttpStatusCode.Forbidden, message)
class BadRequestException(message: String? = null) : HTTPStatusException(HttpStatusCode.BadRequest, message)
class InternalServerException(message: String? = null) : HTTPStatusException(HttpStatusCode.InternalServerError, message)
class NotFoundException(message: String? = null) : HTTPStatusException(HttpStatusCode.NotFound, message)