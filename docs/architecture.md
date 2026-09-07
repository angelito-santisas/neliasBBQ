# Architecture

## Runtime flow

Angular browser app → Spring Boot `/api/v1` → service layer → Spring Data JPA → Supabase PostgreSQL

An order is priced from server-owned menu records, committed transactionally, then published as an asynchronous `order.created` webhook after commit.

## Frontend

Routes lazy-load feature components for Home, Menu, About, Feedback, and Cart. `CartStore` owns signal-based menu/cart state; `ApiService` owns HTTP transport. Feedback uses a typed reactive form. The development proxy avoids environment-specific URLs in application code.

## Backend

Packages are organized by business feature. Controllers only handle HTTP concerns, services own transaction/business rules, repositories own persistence, DTOs are separate from JPA entities, and `ApiExceptionHandler` centralizes validation errors.

Endpoints:

- `GET /api/v1/menu`
- `POST /api/v1/orders`
- `POST /api/v1/feedback`
- `GET /actuator/health`

## Database and security

Flyway owns the normalized schema and seed data. Prices use `numeric`, foreign keys and checks enforce integrity, and high-growth time columns are indexed. Supabase `anon` and `authenticated` roles are revoked because clients must use the Spring API; database credentials stay server-side.

Before payments or public launch, add customer/staff authentication, API rate limiting, idempotency keys for order creation, webhook retry/dead-letter handling, and payment-provider signature verification.
