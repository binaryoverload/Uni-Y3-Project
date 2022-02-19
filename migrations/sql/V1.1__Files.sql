create table files
(
    id                uuid default gen_random_uuid(),
    name              varchar(255) not null,
    original_filename varchar(255) not null,
    hash              varchar(255) not null,
    size              int          not null,
    created_at        timestamp not null default timezone('UTC', now()),
    
    primary key (id),
    unique (hash)
);