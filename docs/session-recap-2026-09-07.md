# Nelia’s BBQ — Work Recap

**Date:** September 7, 2026
**Project:** Nelia’s BBQ
**Repository:** https://github.com/angelito-santisas/neliasBBQ

## What we completed

Connected the Spring Boot backend to Supabase PostgreSQL, applied the database migrations, enabled database security, verified staff sign-in, and pushed the project to GitHub.

## 1. Supabase connection

- Confirmed the connected Supabase project matched the project documented in the README.
- Located the connection details in **Supabase → Connect → Session pooler**.
- Configured the local `.env` with the database connection, database password, Supabase URL, and publishable key.
- Converted the host-only database setting into the JDBC URL required by Spring Boot.
- Retried authentication until the saved database credentials worked.

The connection uses the session pooler on port `5432`, database `postgres`, and `sslmode=require`. Credentials remain in the Git-ignored `.env` file.

## 2. Database migrations and security

Successfully applied all three Flyway migrations:

| Migration | Purpose |
| --- | --- |
| `V1__initial_schema.sql` | Creates menu, order, order-item, and customer-feedback tables, constraints, and indexes. |
| `V2__seed_menu.sql` | Inserts the eight initial menu items. |
| `V3__enable_row_level_security.sql` | Enables row-level security on the application tables. |

Verified that application tables have row-level security enabled and that the Supabase `anon` and `authenticated` roles lack SELECT privileges. Application data access goes through the Spring Boot API.

An initial attempt to protect Flyway’s history table inside V3 timed out while Flyway held its history-table lock. That transaction rolled back. We removed the history-table changes from the pending migration, successfully applied V3, and protected the history table separately.

The separate operation is saved in `database/admin/protect_flyway_history.sql` and was applied to the configured Supabase project. It must run outside Flyway migrations.

## 3. Backend startup fixes

- Added `spring-boot-starter-flyway` so Spring Boot 4 automatically runs Flyway migrations.
- Added `spring-boot-starter-restclient` to provide the HTTP client builder used by the order webhook integration.
- Corrected the feedback entity’s rating mappings to match the database’s `smallint` columns using `@JdbcTypeCode(SqlTypes.SMALLINT)`.
- Expanded the README with connection setup, migration, verification, and history-table protection instructions.

## 4. Staff authentication

- Located staff account UUIDs in **Supabase → Authentication → Users**.
- Added one staff UUID to `STAFF_USER_IDS` in the local `.env`.
- Verified that the UUID belongs to an existing, email-confirmed Supabase account.
- Restarted the backend to load the allowlist.
- Verified that Supabase Auth responded successfully and unauthenticated staff access returned HTTP `401`.
- You confirmed that you could sign in successfully.

Staff sign-in uses the account’s email and password. `STAFF_USER_IDS` is a comma-separated allowlist of account UUIDs. Restart the backend after changing it.

## 5. Verification results

| Check | Result |
| --- | --- |
| Flyway migration history | Versions 1, 2, and 3 recorded as successful |
| Database security | RLS enabled on all four application tables and Flyway history |
| Backend health | `GET /actuator/health` returned `UP` |
| Menu API | `GET /api/v1/menu` returned eight items |
| Backend tests | All four tests passed |
| Frontend tests | All three tests passed |
| Frontend production build | Passed |
| Staff sign-in | Confirmed working by you |

## 6. GitHub push

- Created a Git repository at the project root because the folder previously inherited a repository from the home directory.
- Connected it to the requested GitHub repository and retained its existing commit history.
- Moved the frontend’s empty nested Git metadata into a local backup at `.git/frontend-repo-backup` so frontend files could be tracked by the project repository.
- Replaced the original static-site files with the current Angular, Spring Boot, and Supabase project structure.
- Checked staged files for the configured secret values before committing.
- Excluded `.env`, dependencies, build output, logs, and editor settings from the push.

**Branch:** `main`
**Commit:** `254ab923975b69ccc996eb20bfac8a5518a04b99`
**Message:** `feat: add full-stack BBQ app with Supabase`

[View the pushed commit](https://github.com/angelito-santisas/neliasBBQ/commit/254ab923975b69ccc996eb20bfac8a5518a04b99)

The remote commit matched the local commit, and the working directory was clean immediately after the push. This recap was created afterward and is not part of that commit.

## Running the project locally

Start the backend:

```powershell
cd backend
mvn spring-boot:run
```

Start the frontend in another terminal:

```powershell
cd frontend
npm install
npm start
```

- Application: http://localhost:4200
- Staff login: http://localhost:4200/staff
- Backend health: http://localhost:8080/actuator/health

On a new machine, copy `.env.example` to `.env` and supply the required values locally before starting the backend. The real `.env` was not uploaded to GitHub.

## Remaining work

- Staff inventory and transaction screens are still pending implementation.
- The GitHub push uploaded source code; public application deployment was not performed.
- Outbound webhook delivery was not verified during this session.

No passwords, API keys, access tokens, or staff UUIDs are included in this recap.
