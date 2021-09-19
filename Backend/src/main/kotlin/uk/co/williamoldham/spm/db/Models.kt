package uk.co.williamoldham.spm.db

import io.ktor.auth.Principal
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.`java-time`.datetime
import java.time.LocalDateTime
import java.util.UUID

class User(
    val id: UUID,
    val username: String,
    val updatedAt: LocalDateTime,
    val revocationUUID: UUID,
    val changePasswordOnLogin: Boolean
) : Principal

object Users : Table() {

    val id : Column<UUID> = uuid("id").clientDefault { UUID.randomUUID() }
    val username : Column<String> = varchar("username", 255).uniqueIndex()
    val password : Column<String>  = varchar("password", 255)
    val revocationUUID: Column<UUID> = uuid("revocation").clientDefault { UUID.randomUUID() }
    val updatedAt : Column<LocalDateTime> = datetime("updated_at").clientDefault { LocalDateTime.now() }
    val changePasswordOnLogin : Column<Boolean> = bool("change_password_on_login").default(true)

    override val primaryKey: PrimaryKey
        get() = PrimaryKey(id)

    fun toUser(row: ResultRow): User {
        return User(
            row[id],
            row[username],
            row[updatedAt],
            row[revocationUUID],
            row[changePasswordOnLogin]
        )
    }

}