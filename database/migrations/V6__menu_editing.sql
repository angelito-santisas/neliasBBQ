create table menu_photos (
    id uuid primary key,
    content_type varchar(20) not null check (content_type in ('image/jpeg', 'image/png')),
    content bytea not null check (octet_length(content) between 1 and 2097152)
);
revoke all on table menu_photos from anon, authenticated;
alter table menu_photos enable row level security;
alter table menu_items add column photo_id uuid references menu_photos(id);
alter table menu_items add column stock_available integer check (stock_available between 0 and 1000000);
alter table menu_items add column version bigint not null default 0;
create index menu_items_photo_idx on menu_items(photo_id) where photo_id is not null;
-- Existing counts stay unknown until staff enters them. Unknown/zero counts cannot be ordered.
create index orders_status_created_idx on orders(status, created_at);
alter table orders add column confirmed_by varchar(100);
alter table orders add column confirmed_at timestamptz;
-- Rollback: deploy compatible code before removing columns. Preserve uploaded photos.
