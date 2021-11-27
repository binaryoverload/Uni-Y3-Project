# Entity Planning

## User

To make sure a user is logged out if security information changes, a checksum will be calculated from the password and security stamp.

Columns:
- id - `uuid`
- first_name - `varchar(255)`
- last_name - `varchar(255)`
- username - `varchar(255)`
- password - `varchar(255)`
- updated_at - `timestamp`
- security_stamp - `integer` - Incremented whenever JWT should be invalidated
- checksum - `varchar(70) GENERATED ALWAYS AS sha256((password::text || security_stamp::text)::bytea) STORED` 