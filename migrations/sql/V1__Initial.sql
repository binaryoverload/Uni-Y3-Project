CREATE TABLE users (
    id uuid default gen_random_uuid(),
    username varchar(50) not null,
    password varchar(255) not null,
    updated_at timestamp default timezone('UTC', now()),
    security_stamp integer default 0,
    checksum  varchar(70) GENERATED ALWAYS AS (sha256((password::text || security_stamp::text)::bytea)) STORED,
    first_name varchar(255),
    last_name varchar(255),

    primary key (id),
    unique (username)
);

CREATE TABLE system_properties (
    key varchar(50),
    value text not null,
    
    primary key (key)
);

CREATE TABLE enrolment_tokens (
    id uuid default gen_random_uuid(),
    token varchar(16) not null,
    created_at timestamp default timezone('UTC', now()),
    expires_at timestamp,
    usage_current integer default 0,
    usage_limit integer,

    primary key (id),
    unique (token)
);