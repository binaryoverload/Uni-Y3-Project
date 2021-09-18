package uk.co.williamoldham.spm.plugins

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import io.ktor.serialization.*
import io.ktor.features.*
import io.ktor.application.*
import io.ktor.jackson.jackson
import io.ktor.response.*
import io.ktor.request.*
import io.ktor.routing.*

fun Application.configureSerialization() {
    install(ContentNegotiation) {
        jackson() {
            registerModule(JavaTimeModule())
        }
    }

    routing {
        get("/json/kotlinx-serialization") {
            call.respond(mapOf("hello" to "world"))
        }
    }
}
