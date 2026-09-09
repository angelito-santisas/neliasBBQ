-- Preserve historical feedback without assigning invented order numbers.
alter table customer_feedback add column order_id uuid references orders(id);
alter table customer_feedback add constraint customer_feedback_one_per_order unique (order_id);
-- Existing rows may lack an order; every newly inserted row must have one.
alter table customer_feedback add constraint customer_feedback_order_required check (order_id is not null) not valid;
-- Rollback: deploy compatible code first; retain feedback and order linkage for audit.
