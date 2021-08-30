package uk.co.williamoldham.spm.db

import io.ktor.auth.Principal
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.ColumnType
import org.jetbrains.exposed.sql.CustomFunction
import org.jetbrains.exposed.sql.Expression
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.UUIDColumnType
import org.jetbrains.exposed.sql.`java-time`.datetime
import java.time.LocalDateTime
import java.util.UUID

class User(val id: UUID, val username: String, val updatedAt: LocalDateTime) : Principal

object Users : Table() {

    val id : Column<UUID> = uuid("id").clientDefault { UUID.randomUUID() }
    val username : Column<String> = varchar("username", 255).uniqueIndex()
    val password : Column<String>  = varchar("password", 255)
    val updatedAt : Column<LocalDateTime> = datetime("updated_at").clientDefault { LocalDateTime.now() }

    override val primaryKey: PrimaryKey
        get() = PrimaryKey(id)

    fun toUser(row: ResultRow): User {
        return User(
            row[id],
            row[username],
            row[updatedAt]
        )
    }

}