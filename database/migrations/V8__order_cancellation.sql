-- Pending cancellation does not change stock. Preserve who cancelled and when.
alter table orders add column cancelled_by varchar(100);
alter table orders add column cancelled_at timestamptz;
-- Rollback: deploy compatible code first; retain these nullable audit columns to preserve history.
