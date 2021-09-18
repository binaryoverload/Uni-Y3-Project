package uk.co.williamoldham.spm.plugins

import at.favre.lib.crypto.bcrypt.BCrypt
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.example.plugins.UUIDSerializer
import io.ktor.auth.*
import io.ktor.util.*
import io.ktor.sessions.*
import io.ktor.application.*
import io.ktor.auth.jwt.jwt
import io.ktor.http.HttpStatusCode
import io.ktor.response.*
import io.ktor.request.*
import io.ktor.routing.*
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject
import org.koin.mp.KoinPlatformTools
import org.postgresql.gss.MakeGSS.authenticate
import uk.co.williamoldham.spm.Config
import uk.co.williamoldham.spm.db.User
import uk.co.williamoldham.spm.db.Users
import uk.co.williamoldham.spm.hashPassword
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.temporal.ChronoUnit
import java.util.Date
import java.util.UUID
import java.util.concurrent.TimeUnit

class UserPrincipal(val username: String) : Principal

@Serializable
class JwtUser(val username: String, val password: String) : KoinComponent {

    val config : Config by inject()

    val hashedPassword
        get() = hashPassword(password, config)

}

fun Application.configureSecurity(config: Config) {

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

    routing {

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
}
