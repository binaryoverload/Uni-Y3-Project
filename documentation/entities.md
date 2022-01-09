# Entity Planning

## User

To make sure a user is logged out if security information changes, a checksum will be calculated from the password and security stamp.

Columns:
- id - `uuid` - PK
- username - `varchar(50)`
- password - `varchar(255)`
- updated_at - `timestamp`
- security_stamp - `integer` - Incremented whenever JWT should be invalidated
- checksum - `varchar(70) GENERATED ALWAYS AS (encode(sha256((password::text || security_stamp::text)::bytea), 'hex')) STORED` 
- first_name - `varchar(255)`
- last_name - `varchar(255)`

## Client

This is an entry for a "client" device enrolled onto the system.

Containing some sort of public/private key relationship with the client?

Columns:
- id - `serial` - PK
- name - `varchar(255)`
- public_key - `varchar(66)` 
- last_activity - `timestamp`
- mac_address - `macaddr`
- last_known_ip - `inet`
- last_known_hostname - `varchar(255)`
- os_information - `jsonb`


## System Properties

Key-Value storage for any configuration. 

Columns:
- key - `varchar(50)` - PK
- value - `text`

## Enrolment tokens

Storage for all keys that can be used to join a client to the system. Different keys can be used to join a client to different "tags". Time limited / limited to number of uses. 8 random bytes digested as hex as the token (Use [randomBytes](https://nodejs.org/api/crypto.html#cryptorandombytessize-callback))

Columns:
- id - `uuid` - PK
- token - `varchar(16)`
- created_at - `timestamp`
- expires_at - `timestamp`
- usage_limit - `integer`
- usage_current - `integer`

## Policies

Policies consist of two tables: `policies` and `policy_items`.

Each policy item is linked to a policy. A policy contains the overarching information for the whole policy while policy items specify actions to be run.

A policy can be run on the client by aquring 

### Policy
- id - `uuid` - PK
- name - `varchar(255)`
- description - `text`
- created_at - `timestamp`
- updated_at - `timestamp`
- created_by - `uuid` - "Fake" FK - User UUID that could exist or not

### Policy Item
- id - `uuid` - PK
- policy_id - `uuid` - FK - on delete cascade
- policy_order - `int` - The position of this item in the policy
- type - `varchar(255)` - Type of policy item. Maybe use an enum? `file`, `command`, `package`, etc
- stop_on_error - `bool`
- data - `jsonb`

### Policy Condition
NOT FOR MVP - Implement only if time

Specifies condition(s) that apply to a policy item that are required in order for it to run. Each condition can either halt the policy execution if not met, or skip the current policy item.

## Audit Log

NOT FOR MVP - Implement after all core features

Columns:
- id - `serial` - PK
- type
- timestamp
- data ??