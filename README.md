# Nelia's BBQ

Nelia's BBQ is split into an Angular frontend, Spring Boot REST API, and Supabase PostgreSQL database.

## Structure

- `frontend/` — Angular 21 standalone application
- `backend/` — Spring Boot 4 REST API using controller → service → repository layers
- `database/migrations/` — Flyway migrations applied to Supabase PostgreSQL
- `webhooks/` — integration contract examples; implementation is under `backend/.../integration/webhook`
- `docs/` — architecture notes

## Responsive design requirement

Responsive behavior is a permanent project requirement. Every page, component, form, navigation element, image, and future UI change must remain usable without horizontal scrolling, clipped content, or overlapping controls across mobile, tablet, laptop, and desktop viewport sizes.

Before a frontend change is considered complete, verify it at representative widths including 320 px, 375 px, 768 px, 1024 px, and a desktop width. Prefer fluid layouts, flexible media, and content-driven breakpoints instead of device-specific styling.

## Configure Supabase

Spring Boot loads the root `.env` automatically when started from `backend/` using the commands below. Fill in the JDBC URL, database username/password, Supabase publishable key, and staff user UUIDs there. The project URL is `https://ykiqpgbojpmxxcmozeud.supabase.co`. The `.env` file is ignored by Git; never commit secrets.

Use `KEY=value` lines without surrounding quotes or an `export` prefix (Java properties syntax). Escape literal backslashes as `\\`. Shell environment variables take precedence over file values. Use Supabase's direct connection or session pooler connection string and keep the database password on the backend only. An MCP OAuth connection grants tool access; it does not supply the application's database password.

Complete the local `.env` using the project's **Connect → Session pooler** details:

- `SUPABASE_DB_URL`: `jdbc:postgresql://<session-pooler-host>:5432/postgres?sslmode=require`
- `SUPABASE_DB_USERNAME`: copy the pooler username, usually `postgres.ykiqpgbojpmxxcmozeud`.
- `SUPABASE_DB_PASSWORD`: the database password, not an API key or Supabase login password.
- `SUPABASE_PUBLISHABLE_KEY`: copy the publishable key from **Settings → API Keys**.
- `STAFF_USER_IDS`: add only the UUIDs of intended staff accounts from **Authentication → Users**.

Start the backend from `backend/` once the database values are filled. Flyway applies V1 (schema), V2 (eight menu items), and V3 (row-level security), and Hibernate validates the resulting schema. Let Flyway apply these files; manually running them in the SQL editor leaves Flyway's history out of sync. The configured `postgres` database role can access the tables; browser roles have no policies or application table privileges. See [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).

Verify `http://localhost:8080/actuator/health` returns `UP` and `http://localhost:8080/api/v1/menu` returns eight menu items. Staff login additionally requires the publishable key and staff allowlist; leave the allowlist empty until the intended staff UUIDs are known.

After the first successful migration, run `database/admin/protect_flyway_history.sql` once through the Supabase SQL editor to protect Flyway metadata. This has already been applied to the configured project. Keep it outside Flyway migrations because Flyway holds a history-table lock on a separate connection.

PowerShell example:

```powershell
$env:SUPABASE_DB_URL='jdbc:postgresql://HOST:5432/postgres?sslmode=require'
$env:SUPABASE_DB_USERNAME='postgres.PROJECT_REF'
$env:SUPABASE_DB_PASSWORD='YOUR_PASSWORD'
```

## Run

### Staff login

Click the Nelia's BBQ title eight times, with no more than three seconds between clicks, to open staff management. Direct access at `/staff` also requires login.

Create staff accounts in Supabase Authentication and add their user UUIDs to the backend `STAFF_USER_IDS` environment variable (comma-separated). Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` as shown in `.env.example`, then restart Spring Boot. An empty staff list denies all staff access. Do not use the service-role key.

The API validates each staff token through Supabase Auth and checks the UUID allowlist. All `/api/v1/staff/**` endpoints require staff authorization. Sessions are held in browser memory; refresh or sign-out clears local access. Sign-out does not revoke an already issued token at Supabase. Inventory and transaction screens are still pending implementation.

Authentication API reference: [Supabase Auth](https://github.com/supabase/auth). Deploy login over HTTPS and configure Supabase authentication rate limits before public use.

Terminal 1:

```powershell
cd backend
mvn spring-boot:run
```

Terminal 2:

```powershell
cd frontend
npm install
npm start
```

Open <http://localhost:4200>. Angular proxies `/api` to Spring Boot at port 8080.

## Verify

```powershell
cd backend; mvn test
cd ../frontend; npm test -- --watch=false; npm run build
```
