package uk.co.williamoldham.spm.routes

import at.favre.lib.crypto.bcrypt.BCrypt
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
import org.jetbrains.exposed.sql.update
import uk.co.williamoldham.spm.config
import uk.co.williamoldham.spm.db.User
import uk.co.williamoldham.spm.db.Users
import uk.co.williamoldham.spm.plugins.createJWT
import java.time.LocalDateTime
import java.time.ZoneOffset

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
            throw UnauthorisedException()
        }

        val result = BCrypt.verifyer().verify(jwtUser.password.toByteArray(), dbUser[Users.password].toByteArray())

        if (result.verified) {
            val token = createJWT(
                dbUser[Users.username],
                dbUser[Users.updatedAt].toEpochSecond(ZoneOffset.UTC)
            )

            call.respond(hashMapOf("token" to token))
        } else {
            logger.debug("Login Request: Password for user '${jwtUser.username}' failed to verify bcrypt")
            throw UnauthorisedException()
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

        post("/auth/user/password") {
            val logger = call.application.environment.log
            val reqData = call.receive<ChangePasswordReq>()
            val user = call.principal<User>() ?: throw UnauthorisedException()

            val dbUser = try {
                transaction {
                    Users.select { Users.id eq user.id }.first()
                }
            } catch (e: NoSuchElementException) {
                throw UnauthorisedException();
            }

            if (reqData.oldPassword == reqData.newPassword) {
                throw BadRequestException("New and old password cannot be the same!")
            }

            if (BCrypt.verifyer().verify(reqData.oldPassword.toByteArray(), dbUser[Users.password].toByteArray()).verified) {
                val newPassHash = BCrypt.withDefaults().hashToString(config.bcryptConfig.cost, reqData.newPassword.toCharArray())

                transaction {
                    Users.update({ Users.id eq user.id }) {
                        it[password] = newPassHash
                        it[updatedAt] = LocalDateTime.now(ZoneOffset.UTC)
                    }
                }

                call.respond(HttpStatusCode.OK)
            } else {
                logger.debug("Password Change Request: Password for user '${user.username}' failed to verify bcrypt")
                throw UnauthorisedException()
            }

        }

    }


}