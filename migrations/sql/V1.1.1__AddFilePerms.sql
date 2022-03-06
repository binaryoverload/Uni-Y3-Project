alter table files
    add permission smallint default 644;

alter table files
    add owner_user text not null default 'root';

alter table files
    add owner_group text default 'root';