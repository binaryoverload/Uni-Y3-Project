CREATE TABLE users (
    id uuid default gen_random_uuid(),
    username varchar(50) not null,
    password varchar(255) not null,
    updated_at timestamp not null default timezone('UTC', now()),
    security_stamp integer not null default 0,
    checksum  varchar(70) GENERATED ALWAYS AS (encode(sha256((password::text || security_stamp::text)::bytea), 'hex')) STORED,
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
    created_at timestamp not null default timezone('UTC', now()),
    expires_at timestamp,
    usage_current integer not null default 0,
    usage_limit integer,

    primary key (id),
    unique (token)
);

CREATE TABLE policies (
    id uuid default gen_random_uuid(),
    created_at timestamp not null default timezone('UTC', now()),
    created_by uuid not null,

    primary key (id)
);

CREATE TYPE policy_item_type AS ENUM ('file', 'command', 'package');

CREATE TABLE policy_items (
    id uuid default gen_random_uuid(),
    policy_id uuid not null,
    policy_order int not null,
    type policy_item_type not null,
    stop_on_error boolean not null default 'true',
    data jsonb not null default '{}',

    primary key (id),
    foreign key (policy_id) references policies(id) on delete cascade,
    unique (policy_id, policy_order)
);