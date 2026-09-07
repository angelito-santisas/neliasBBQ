-- Run once after Flyway has finished, outside a Flyway migration.
-- Flyway holds a history-table lock on a separate connection during migration.
alter table public.flyway_schema_history enable row level security;
revoke all on table public.flyway_schema_history from anon, authenticated;
