package uk.co.williamoldham.spm

import at.favre.lib.crypto.bcrypt.BCrypt

fun hashPassword(password: String, config: Config): String {
    return BCrypt.withDefaults().hashToString(config.bcryptConfig.cost, password.toCharArray())
}

private val charPool: List<Char> = ('a'..'z') + ('A'..'Z') + ('0'..'9')

fun randomString(length: Int): String {
    return (1..length)
        .map { _ -> kotlin.random.Random.nextInt(0, charPool.size) }
        .map(charPool::get)
        .joinToString("");
}

