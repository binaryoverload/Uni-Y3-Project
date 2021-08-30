package com.example.plugins

import io.ktor.sessions.SessionSerializer
import java.util.UUID

class UUIDSerializer : SessionSerializer<UUID> {

    override fun deserialize(text: String): UUID {
        return UUID.fromString(text)
    }

    override fun serialize(session: UUID): String {
        return session.toString()
    }
}