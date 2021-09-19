package uk.co.williamoldham.spm.routes

import kotlinx.serialization.Serializable
import uk.co.williamoldham.spm.config
import uk.co.williamoldham.spm.hashPassword

@Serializable
class JwtUser(val username: String, val password: String) {

    val hashedPassword
        get() = hashPassword(password, config)

}

@Serializable
class ChangePasswordReq(val oldPassword: String, val newPassword: String)