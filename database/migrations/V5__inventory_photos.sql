create table inventory_photos (
    id uuid primary key,
    content_type varchar(20) not null check (content_type in ('image/jpeg', 'image/png')),
    content bytea not null check (octet_length(content) between 1 and 2097152)
);
alter table inventory_items add column photo_id uuid references inventory_photos(id);
create index inventory_items_photo_idx on inventory_items(photo_id) where photo_id is not null;
revoke all on table inventory_photos from anon, authenticated;
alter table inventory_photos enable row level security;
-- To roll back, deploy an application version that does not use photos first.
-- Preserve photo data; remove the column/table only in a deliberate later migration.
