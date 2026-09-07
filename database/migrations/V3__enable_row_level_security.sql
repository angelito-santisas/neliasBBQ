-- All application data access goes through Spring Boot's database connection.
-- No browser-role policies: deny access even if table grants change later.
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.customer_feedback enable row level security;

-- Rollback, if required, must be a new forward migration that disables RLS
-- on these tables. Retain the revoked browser-role privileges.
