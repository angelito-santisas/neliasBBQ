create table store_settings (
    id smallint primary key check (id = 1),
    is_open boolean not null default true,
    updated_at timestamptz not null default now(),
    updated_by varchar(100)
);
insert into store_settings (id, is_open) values (1, true);
revoke all on table store_settings from anon, authenticated;
alter table store_settings enable row level security;
