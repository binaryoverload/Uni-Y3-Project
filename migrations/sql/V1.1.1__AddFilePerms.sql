alter table files
    add permission smallint default 644;

alter table files
    add owner_user text not null;

alter table files
    add owner_group text;