package uk.co.williamoldham.spm.plugins

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.example.plugins.UUIDSerializer
import io.ktor.application.Application
import io.ktor.application.install
import io.ktor.auth.Authentication
import io.ktor.auth.jwt.jwt
import io.ktor.sessions.Sessions
import io.ktor.sessions.cookie
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import uk.co.williamoldham.spm.config
import uk.co.williamoldham.spm.db.Users
import uk.co.williamoldham.spm.hashPassword
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.temporal.ChronoUnit
import java.util.UUID

@Serializable
class JwtUser(val username: String, val password: String) {

    val hashedPassword
        get() = hashPassword(password, config)

}

fun Application.configureSecurity() {

    install(Sessions) {
        cookie<UUID>("session") {
            serializer = UUIDSerializer()
        }
    }

    install(Authentication) {
        jwt {
            verifier(
                JWT
                    .require(Algorithm.HMAC256(config.jwtConfig.secret))
                    .build()
            )
            validate { jwtCredential ->
                val username = jwtCredential["username"] ?: return@validate null
                val updatedAt = LocalDateTime.ofEpochSecond((jwtCredential.getClaim("updated_at", Long::class) ?: return@validate null), 0, ZoneOffset.UTC)

                println("$username $updatedAt")

                val user = transaction {
                    Users.select { Users.username eq username }.first()
                }

                if (user[Users.updatedAt].truncatedTo(ChronoUnit.SECONDS) > updatedAt.truncatedTo(ChronoUnit.SECONDS)) {
                    null
                } else {
                    Users.toUser(user)
                }
            }
        }
    }
}
