package uk.co.williamoldham.spm.routes

import at.favre.lib.crypto.bcrypt.BCrypt
import io.ktor.application.call
import io.ktor.application.log
import io.ktor.auth.authenticate
import io.ktor.auth.principal
import io.ktor.http.HttpStatusCode
import io.ktor.request.receive
import io.ktor.response.respond
import io.ktor.routing.Route
import io.ktor.routing.delete
import io.ktor.routing.get
import io.ktor.routing.post
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import uk.co.williamoldham.spm.config
import uk.co.williamoldham.spm.db.User
import uk.co.williamoldham.spm.db.Users
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.UUID

fun Route.userRoutes() {
    authenticate {
        get("/user") {
            val user = call.principal<User>()
            if (user == null) {
                throw UnauthorisedException()
            } else {
                call.respond(user)
            }
        }

        get("/user/{user}") {
            val currentUser = call.principal<User>() ?: throw UnauthorisedException()

            // TODO Check permissions

            val userId = getUUIDOrThrow(call.parameters["user"])

            val dbUser = try {
                 transaction {
                    Users.select { Users.id eq userId }.first()
                }
            } catch (e: NoSuchElementException) {
                throw NotFoundException("User $userId is not found")
            }

            call.respond(Users.toUser(dbUser))
        }

        delete("/user/{user}") {

            val logger = call.application.log

            val currentUser = call.principal<User>() ?: throw UnauthorisedException()
            // TODO: Check permission of user to delete

            val userId = getUUIDOrThrow(call.parameters["user"])

            if (userId == currentUser.id) {
                throw ForbiddenException("A user cannot delete themselves")
            }

            val deletedRows = transaction {
                Users.deleteWhere { Users.id eq userId }
            }

            if (deletedRows == 1) {
                call.respond(HttpStatusCode.OK)
            } else {
                logger.debug("Delete user ${userId} failed. Expected 1 deleted row, got $deletedRows")
                throw InternalServerException("Could not delete user")
            }
        }

        post("/user/password") {
            val logger = call.application.log
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
                throw ForbiddenException("New and old password cannot be the same!")
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

fun getUUIDOrThrow(uuid: String?): UUID {
    if (uuid == null) {
        throw BadRequestException("User UUID is null")
    }
    return try {
        UUID.fromString(uuid)
    } catch (e: IllegalArgumentException) {
        throw BadRequestException("User UUID is not in correct format")
    }
}
