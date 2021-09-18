package uk.co.williamoldham.spm.db

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.github.cdimascio.dotenv.Dotenv
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.insertIgnore
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory
import uk.co.williamoldham.spm.Config
import uk.co.williamoldham.spm.hashPassword

fun setupPostgres(dotenv: Dotenv): Database {
    require(dotenv.get("POSTGRES_JDBC_URL") != null) { "The env variable POSTGRES_JDBC_URL is required!" }
    require(dotenv.get("POSTGRES_USER") != null) { "The env variable POSTGRES_USER is required!" }
    require(dotenv.get("POSTGRES_PASSWORD") != null) { "The env variable POSTGRES_PASSWORD is required!" }

    val hikariDataSource = hikari(
        dotenv.get("POSTGRES_JDBC_URL"),
        dotenv.get("POSTGRES_USER"),
        dotenv.get("POSTGRES_PASSWORD")
    )

    val database = Database.connect(hikariDataSource)

    transaction {
        SchemaUtils.create(Users)
    }

    return database
}

fun databaseInitialise(config: Config) {
    transaction {
        val insertedCount = Users.insertIgnore {
            it[username] = "admin"
            it[password] = hashPassword(config.defaultAdminPassword, config)
        }.insertedCount
        if (insertedCount > 0) {
            LoggerFactory.getLogger("Postgres").info("Created default user \"admin\" with password \"${config.defaultAdminPassword}\"")
        }
    }
}

private fun hikari(jdbcUrl: String, username: String, password: String): HikariDataSource {
    val config = HikariConfig()
    config.driverClassName = "org.postgresql.Driver"
    config.maximumPoolSize = 5
    config.jdbcUrl = jdbcUrl
    config.username = username
    config.password = password
    config.validate()
    return HikariDataSource(config)
}