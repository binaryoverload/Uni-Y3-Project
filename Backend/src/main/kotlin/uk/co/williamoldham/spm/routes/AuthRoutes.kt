package uk.co.williamoldham.spm.routes

import at.favre.lib.crypto.bcrypt.BCrypt
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.application.call
import io.ktor.application.log
import io.ktor.auth.jwt.JWTCredential
import io.ktor.request.receive
import io.ktor.response.respond
import io.ktor.routing.Route
import io.ktor.routing.post
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import uk.co.williamoldham.spm.config
import uk.co.williamoldham.spm.db.Users
import uk.co.williamoldham.spm.plugins.TokenType
import uk.co.williamoldham.spm.plugins.createJWT
import java.util.UUID

fun Route.authRoutes() {

    post("/auth/login") {
        val logger = call.application.log

        val loginUser = call.receive<LoginUser>()

        val dbUser = transaction {
            Users.select { (Users.username eq loginUser.username) }
                .firstOrNull()
        }

        if (dbUser == null) {
            logger.debug("Login Request: Username '${loginUser.username}' not found in DB")
            throw UnauthorisedException()
        }

        val result = BCrypt.verifyer().verify(loginUser.password.toByteArray(), dbUser[Users.password].toByteArray())

        if (result.verified) {
            val accessToken = createJWT(
                dbUser[Users.username],
                dbUser[Users.revocationUUID],
                TokenType.ACCESS,
                config.jwtConfig.accessValidDuration
            )

            val refreshToken = createJWT(
                dbUser[Users.username],
                dbUser[Users.revocationUUID],
                TokenType.REFRESH,
                config.jwtConfig.refreshValidDuration
            )

            call.respond(
                hashMapOf(
                    "access_token" to accessToken,
                    "refresh_token" to refreshToken
                )
            )
        } else {
            logger.debug("Login Request: Password for user '${loginUser.username}' failed to verify bcrypt")
            throw UnauthorisedException()
        }

    }

    post("/auth/refresh") {
        val data = call.receive<RefreshTokenReq>()

        val jwtCredential = JWTCredential(
            JWT.require(Algorithm.HMAC256(config.jwtConfig.secret))
                .build().verify(data.refreshToken)
        )

        val username = jwtCredential["username"] ?: throw BadRequestException("JWT: Username not present")
        val revocationUUID = try {
            UUID.fromString(
                jwtCredential["revocation_uuid"] ?: throw  BadRequestException("JWT: Revocation UUID is not present")
            )
        } catch (e: IllegalArgumentException) {
            throw BadRequestException("JWT: Revocation UUID not in correct format")
        }
        val tokenType = try {
            TokenType.valueOf(jwtCredential["token_type"] ?: throw BadRequestException("JWT: Token type not present"))
        } catch (e: IllegalArgumentException) {
            throw BadRequestException("JWT: Token type is invalid")
        }

        if (tokenType != TokenType.REFRESH) {
            throw ForbiddenException("JWT: Token type is not refresh")
        }

        val user = transaction {
            Users.select { Users.username eq username }.first()
        }

        if (user[Users.revocationUUID] != revocationUUID) {
            throw UnauthorisedException("JWT Revoked")
        } else {
            call.respond(mapOf("access_token" to createJWT(
                user[Users.username],
                user[Users.revocationUUID],
                TokenType.ACCESS,
                config.jwtConfig.accessValidDuration
            )))
        }

    }

}