package uk.co.williamoldham.spm.db

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.github.cdimascio.dotenv.Dotenv
import io.github.cdimascio.dotenv.dotenv
import org.jetbrains.exposed.sql.Database

fun setupPostgres(dotenv: Dotenv): Database {
    require(dotenv.get("POSTGRES_JDBC_URL") != null) { "The env variable POSTGRES_JDBC_URL is required!" }
    require(dotenv.get("POSTGRES_USER") != null) { "The env variable POSTGRES_USER is required!" }
    require(dotenv.get("POSTGRES_PASSWORD") != null) { "The env variable POSTGRES_PASSWORD is required!" }

    val hikariDataSource = hikari(
        dotenv.get("POSTGRES_JDBC_URL"),
        dotenv.get("POSTGRES_USER"),
        dotenv.get("POSTGRES_PASSWORD")
    )

    return Database.connect(hikariDataSource)
}

private fun hikari(jdbcUrl: String, username: String, password: String) : HikariDataSource {
    val config = HikariConfig()
    config.driverClassName = "org.postgresql.Driver"
    config.maximumPoolSize = 5
    config.jdbcUrl = jdbcUrl
    config.username = username
    config.password = password
    config.validate()
    return HikariDataSource(config)
}