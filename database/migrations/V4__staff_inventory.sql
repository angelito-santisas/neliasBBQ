create table inventory_items (
    id uuid primary key,
    name varchar(120) not null,
    sku varchar(40) not null,
    category varchar(80) not null,
    unit varchar(30) not null,
    quantity numeric(12, 2) not null default 0 check (quantity >= 0),
    reorder_level numeric(12, 2) not null default 0 check (reorder_level >= 0),
    unit_cost numeric(10, 2) not null default 0 check (unit_cost >= 0),
    active boolean not null default true,
    updated_at timestamptz not null,
    constraint inventory_items_sku_unique unique (sku)
);

create table inventory_movements (
    id uuid primary key,
    inventory_item_id uuid not null references inventory_items(id),
    movement_type varchar(20) not null check (movement_type in ('RECEIVED', 'USED', 'CORRECTION')),
    quantity_delta numeric(12, 2) not null check (quantity_delta <> 0),
    note varchar(240) not null default '',
    created_by varchar(100) not null,
    created_at timestamptz not null
);

create index inventory_items_category_name_idx on inventory_items (category, name);
create index inventory_movements_item_created_idx on inventory_movements (inventory_item_id, created_at desc);

insert into inventory_items (id, name, sku, category, unit, quantity, reorder_level, unit_cost, active, updated_at) values
('10000000-0000-0000-0000-000000000001', 'Pork shoulder', 'MEAT-PORK-01', 'Meat', 'kg', 18.00, 8.00, 265.00, true, now()),
('10000000-0000-0000-0000-000000000002', 'Chicken intestines', 'MEAT-ISAW-01', 'Meat', 'kg', 5.50, 6.00, 155.00, true, now()),
('10000000-0000-0000-0000-000000000003', 'Chicken gizzard', 'MEAT-GIZ-01', 'Meat', 'kg', 7.00, 5.00, 175.00, true, now()),
('10000000-0000-0000-0000-000000000004', 'Coconut charcoal', 'SUP-CHAR-01', 'Supplies', 'sack', 3.00, 4.00, 390.00, true, now()),
('10000000-0000-0000-0000-000000000005', 'Banana ketchup', 'SAUCE-BK-01', 'Sauces', 'bottle', 14.00, 6.00, 58.00, true, now()),
('10000000-0000-0000-0000-000000000006', 'Calamansi', 'PROD-CAL-01', 'Produce', 'kg', 0.00, 3.00, 120.00, true, now());

revoke all on table inventory_items, inventory_movements from anon, authenticated;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
