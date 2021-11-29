# Entity Planning

## User

To make sure a user is logged out if security information changes, a checksum will be calculated from the password and security stamp.

Columns:
- id - `serial` - PK
- username - `varchar(50)`
- password - `varchar(255)`
- updated_at - `timestamp`
- security_stamp - `integer` - Incremented whenever JWT should be invalidated
- checksum - `varchar(70) GENERATED ALWAYS AS sha256((password::text || security_stamp::text)::bytea) STORED` 
- first_name - `varchar(50)`
- last_name - `varchar(50)`

## Computer

This is an entry for a "client" device enrolled onto the system.

Columns:
- id - `serial` - PK


## System Properties

Key-Value storage for any configuration. 

Columns:
- key - `varchar(50)` - PK
- value - `text`

## Joining Keys

Storage for all keys that can be used to join a client to the system. Different keys can be used to join a client to different "tags". Time limited / limited to number of uses. 8 random bytes digested as hex as the token (Use [randomBytes](https://nodejs.org/api/crypto.html#cryptorandombytessize-callback))

Columns:
- id - `serial` - PK
- token - `varchar(16)`
- created_at - `timestamp`
- expires_at - `timestamp`
- usage_limit - `integer`
- usage_current - `integer`


## Audit Log

NOT FOR MVP - Implement after all core features

Columns:
- id - `serial` - PK
- type
- timestamp
- data ??