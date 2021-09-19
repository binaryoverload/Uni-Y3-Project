package uk.co.williamoldham.spm.plugins

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.application.Application
import io.ktor.application.install
import io.ktor.auth.Authentication
import io.ktor.auth.jwt.jwt
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import uk.co.williamoldham.spm.config
import uk.co.williamoldham.spm.db.Users
import uk.co.williamoldham.spm.hashPassword
import uk.co.williamoldham.spm.routes.UnauthorisedException
import java.time.Duration
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.Date

fun Application.configureSecurity() {

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

                val user = transaction {
                    Users.select { Users.username eq username }.first()
                }

                // Check that the user in the table has not been updated after the JWT was issued.
                // If it has, reject the request and force the user to re-login
                if (Duration.between(user[Users.updatedAt], updatedAt).toSeconds() >= 1) {
                    throw UnauthorisedException("JWT Expired")
                } else {
                    Users.toUser(user)
                }
            }
        }
    }
}

fun createJWT(username: String, updatedAt: Long) : String {
    return JWT.create()
        .withClaim("username", username)
        .withClaim("updated_at", updatedAt)
        .withExpiresAt(Date(System.currentTimeMillis() + config.jwtConfig.validDuration))
        .sign(Algorithm.HMAC256(config.jwtConfig.secret))
}
