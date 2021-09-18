package uk.co.williamoldham.spm.routes

import at.favre.lib.crypto.bcrypt.BCrypt
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.application.call
import io.ktor.auth.authenticate
import io.ktor.auth.principal
import io.ktor.http.HttpStatusCode
import io.ktor.request.receive
import io.ktor.response.respond
import io.ktor.routing.Route
import io.ktor.routing.get
import io.ktor.routing.post
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import uk.co.williamoldham.spm.config
import uk.co.williamoldham.spm.db.User
import uk.co.williamoldham.spm.db.Users
import uk.co.williamoldham.spm.plugins.JwtUser
import java.time.ZoneOffset
import java.util.Date

fun Route.authRoutes() {

    post("/auth/login") {
        val logger = call.application.environment.log

        val jwtUser = call.receive<JwtUser>()

        val dbUser = transaction {
            Users.select { (Users.username eq jwtUser.username) }
                .firstOrNull()
        }

        if (dbUser == null) {
            logger.debug("Login Request: Username '${jwtUser.username}' not found in DB")
            throw AuthenticationException()
        }

        val result = BCrypt.verifyer().verify(jwtUser.password.toByteArray(), dbUser[Users.password].toByteArray())

        if (result.verified) {
            val token = JWT.create()
                .withClaim("username", dbUser[Users.username])
                .withClaim("updated_at", dbUser[Users.updatedAt].toEpochSecond(ZoneOffset.UTC))
                .withExpiresAt(Date(System.currentTimeMillis() + config.jwtConfig.validDuration))
                .sign(Algorithm.HMAC256(config.jwtConfig.secret))

            call.respond(hashMapOf("token" to token))
        } else {
            logger.debug("Login Request: Password for user '${jwtUser.username}' failed to verify bcrypt")
            throw AuthenticationException()
        }

    }

    authenticate {
        get("/auth/user") {
            val user = call.principal<User>()
            if (user == null) {
                call.respond(HttpStatusCode.NotFound)
            } else {
                call.respond(user)
            }
        }
    }



}