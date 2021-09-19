package uk.co.williamoldham.spm.routes

import com.fasterxml.jackson.annotation.JsonProperty
import uk.co.williamoldham.spm.config
import uk.co.williamoldham.spm.hashPassword

class LoginUser(val username: String, val password: String) {

    val hashedPassword
        get() = hashPassword(password, config)

}

class ChangePasswordReq(val oldPassword: String, val newPassword: String)

class RefreshTokenReq(
    @JsonProperty("refresh_token")
    val refreshToken: String
)