const queries = {
    user: {
        create: "INSERT INTO users(username, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id",
        getAll: "SELECT id,username,password,first_name,last_name,checksum FROM users",
        getUsername: "SELECT id,username,password,first_name,last_name,checksum FROM users WHERE username=$1",
        getId: "SELECT id,username,password,first_name,last_name,checksum FROM users WHERE id=$1"
    },
    systemProperties: {
        get: "SELECT value FROM system_properties WHERE key=$1",
        set: "INSERT INTO system_properties (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET key = EXCLUDED.key"
    },
    enrolmentTokens: {
        getAll: "SELECT id, token, created_at, expires_at, usage_current, usage_limit FROM enrolment_tokens",
        get: "SELECT id, token, created_at, expires_at, usage_current, usage_limit FROM enrolment_tokens WHERE id=$1",
        create: "INSERT INTO enrolment_tokens (token) VALUES ($1) RETURNING id, token, created_at, usage_current",
        update: "UPDATE enrolment_tokens SET expires_at=$2, usage_current=$3, usage_limit=$4 WHERE id=$1",
        delete: "DELETE FROM enrolment_tokens WHERE id=$1"
    }

}

module.exports = queries