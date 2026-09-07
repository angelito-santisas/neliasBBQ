create table menu_items (
    id varchar(50) primary key,
    name varchar(120) not null,
    category varchar(80) not null,
    description varchar(500) not null,
    image_url text not null,
    price numeric(10, 2) not null check (price >= 0),
    active boolean not null default true
);

create table orders (
    id uuid primary key,
    subtotal numeric(10, 2) not null check (subtotal >= 0),
    service_fee numeric(10, 2) not null check (service_fee >= 0),
    total numeric(10, 2) not null check (total >= 0),
    special_instructions varchar(300) not null default '',
    status varchar(30) not null,
    created_at timestamptz not null
);

create table order_items (
    id uuid primary key,
    order_id uuid not null references orders(id) on delete cascade,
    menu_item_id varchar(50) not null references menu_items(id),
    item_name varchar(120) not null,
    unit_price numeric(10, 2) not null check (unit_price >= 0),
    quantity integer not null check (quantity between 1 and 99),
    line_total numeric(10, 2) not null check (line_total >= 0),
    unique (order_id, menu_item_id)
);

create table customer_feedback (
    id uuid primary key,
    overall_rating smallint not null check (overall_rating between 1 and 5),
    food_quality_rating smallint check (food_quality_rating between 1 and 5),
    would_recommend boolean not null,
    comments varchar(1000) not null default '',
    anonymous boolean not null default false,
    created_at timestamptz not null
);

create index orders_created_at_idx on orders (created_at desc);
create index order_items_order_id_idx on order_items (order_id);
create index customer_feedback_created_at_idx on customer_feedback (created_at desc);

-- The browser never talks directly to Supabase. Keep PostgREST roles closed.
revoke all on table menu_items, orders, order_items, customer_feedback from anon, authenticated;
