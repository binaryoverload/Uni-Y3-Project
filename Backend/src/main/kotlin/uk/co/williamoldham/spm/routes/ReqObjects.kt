package uk.co.williamoldham.spm.routes

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import uk.co.williamoldham.spm.config
import uk.co.williamoldham.spm.hashPassword

@Serializable
class LoginUser(val username: String, val password: String) {

    val hashedPassword
        get() = hashPassword(password, config)

}

@Serializable
class ChangePasswordReq(val oldPassword: String, val newPassword: String)

@Serializable
class RefreshTokenReq(
    @SerialName("refresh_token")
    val refreshToken: String
)