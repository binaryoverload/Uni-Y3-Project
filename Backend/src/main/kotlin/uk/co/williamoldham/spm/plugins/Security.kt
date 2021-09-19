package uk.co.williamoldham.spm.plugins

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.application.Application
import io.ktor.application.install
import io.ktor.auth.Authentication
import io.ktor.auth.jwt.jwt
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import uk.co.williamoldham.spm.config
import uk.co.williamoldham.spm.db.Users
import uk.co.williamoldham.spm.routes.BadRequestException
import uk.co.williamoldham.spm.routes.ForbiddenException
import uk.co.williamoldham.spm.routes.UnauthorisedException
import java.lang.IllegalArgumentException
import java.util.Date
import java.util.UUID

fun Application.configureSecurity() {

    install(Authentication) {
        jwt {
            verifier(
                JWT
                    .require(Algorithm.HMAC256(config.jwtConfig.secret))
                    .build()
            )
            validate { jwtCredential ->
                val username = jwtCredential["username"] ?: throw BadRequestException("JWT: Username not present")
                val revocationUUID = try {
                    UUID.fromString(jwtCredential["revocation_uuid"] ?: throw  BadRequestException("JWT: Revocation UUID is not present"))
                } catch (e: IllegalArgumentException) {
                    throw BadRequestException("JWT: Revocation UUID not in correct format")
                }
                val tokenType = try {
                    TokenType.valueOf(jwtCredential["token_type"] ?: throw BadRequestException("JWT: Token type not present"))
                } catch (e: IllegalArgumentException) {
                    throw BadRequestException("JWT: Token type is invalid")
                }

                if (tokenType != TokenType.ACCESS) {
                    throw ForbiddenException("JWT: Token type is not access")
                }

                val user = transaction {
                    Users.select { Users.username eq username }.first()
                }

                // Check that the user in the table has not been updated after the JWT was issued.
                // If it has, reject the request and force the user to re-login
                if (user[Users.revocationUUID] != revocationUUID) {
                    throw UnauthorisedException("JWT Revoked")
                } else {
                    Users.toUser(user)
                }
            }
        }
    }
}

enum class TokenType {
    ACCESS,
    REFRESH
}

fun createJWT(username: String, revocationUUID: UUID, type: TokenType, validDuration: Long) : String {
    return JWT.create()
        .withClaim("username", username)
        .withClaim("revocation_uuid", revocationUUID.toString())
        .withClaim("token_type", type.name)
        .withExpiresAt(Date(System.currentTimeMillis() + validDuration))
        .sign(Algorithm.HMAC256(config.jwtConfig.secret))
}
