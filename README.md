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

## Local prerequisites

- Java JDK 17 (including `javac`) and Apache Maven 3.9.x. Set `JAVA_HOME` to the JDK directory and add the JDK and Maven `bin` directories to your user `Path`.
- Node.js 24 LTS and npm. Angular 21 supports Node.js 24; see [Angular version compatibility](https://angular.dev/reference/versions).
- Spring Boot and its database libraries are installed by Maven from `backend/pom.xml`. Angular and its CLI are installed locally from `frontend/package-lock.json`; no global Angular installation is required.
- The database is hosted by Supabase, so the documented setup does not require a local PostgreSQL or Docker installation.

After installing tools or changing `Path`, restart VS Code and open new terminals. Check `java -version`, `javac -version`, `mvn -version`, `node --version`, and `npm.cmd --version`.

Restore frontend dependencies with `cd frontend` followed by `npm.cmd ci`. On Windows PowerShell, use `npm.cmd` in place of `npm` if execution policy blocks `npm.ps1`; no execution-policy change is necessary. Angular CLI commands can be run locally using `npm.cmd exec -- ng version` (or `npm.cmd run ng -- generate component NAME`).

If the root `.env` is missing, copy `.env.example` to `.env` and fill in the values below. Do not overwrite an existing configured `.env`.

## Configure Supabase

Spring Boot loads the root `.env` automatically when started from `backend/` using the commands below. Fill in the JDBC URL, database username/password, Supabase publishable key, and staff user UUIDs there. The project URL is `https://ykiqpgbojpmxxcmozeud.supabase.co`. The `.env` file is ignored by Git; never commit secrets.

Use `KEY=value` lines without surrounding quotes or an `export` prefix (Java properties syntax). Escape literal backslashes as `\\`. Shell environment variables take precedence over file values. Use Supabase's direct connection or session pooler connection string and keep the database password on the backend only. An MCP OAuth connection grants tool access; it does not supply the application's database password.

Complete the local `.env` using the project's **Connect → Session pooler** details:

- `SUPABASE_DB_URL`: `jdbc:postgresql://<session-pooler-host>:5432/postgres?sslmode=require`
- `SUPABASE_DB_USERNAME`: copy the pooler username, usually `postgres.ykiqpgbojpmxxcmozeud`.
- `SUPABASE_DB_PASSWORD`: the database password, not an API key or Supabase login password.
- `SUPABASE_PUBLISHABLE_KEY`: copy the publishable key from **Settings → API Keys**.
- `STAFF_USER_IDS`: add only the UUIDs of intended staff accounts from **Authentication → Users**.

Start the backend from `backend/` once the database values are filled. Flyway applies all pending migrations through V7 (persisted store status), and Hibernate validates the resulting schema. Let Flyway apply these files; manually running them in the SQL editor leaves Flyway's history out of sync. The configured `postgres` database role can access the tables; browser roles have no policies or application table privileges. See [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).

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

The API validates each staff token through Supabase Auth and checks the UUID allowlist. All `/api/v1/staff/**` endpoints require staff authorization. Sessions are held in browser memory; refresh or sign-out clears local access. Sign-out does not revoke an already issued token at Supabase. The staff inventory workspace supports stock visibility, low-stock alerts, item creation, and auditable received/used adjustments. Transaction management is still pending implementation.

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

## Staff menu and inventory photos

Use **Staff → Menu → Add product** to create a product with its title, category, description, price, stock count, visibility, and optional picture. Category choices include Classics, Offal Delights, Specialty Dipping Sauces, Sides, Drinks, Desserts, and any existing menu categories. The category dropdown is also available when editing an item. New products receive a generated ID; products without a picture use a placeholder until one is uploaded. Published products appear in the customer menu under their selected category.

The staff **Menu** tab reads the existing Supabase `menu_items` table through the authenticated API. Use **Edit item** to update its title, description, price, picture, stock count, and visibility. The original picture stays unless replaced with a JPG or PNG (2 MB / 12 megapixels maximum). Menu pictures are public so customers can see them; inventory pictures remain staff-only. The editor detects intervening updates, including stock deductions, and asks you to refresh instead of overwriting newer data.

Customers see portions available. Shared menu and store-status checks run every 15 seconds while the application is visible, and on focus, returning to the tab, and reconnecting. Checkout checks availability again before submission. Failed checks, removed products, or insufficient portions block ordering. Removed products remain in the cart for review and removal. Existing dishes have unknown stock until staff enters a count; unknown or zero stock cannot be ordered. Menu portions are separate from ingredient inventory quantities.

Checkout creates a **submitted** order without deducting stock. In **Staff → Orders**, use **Confirm order** to deduct its portions and mark it **confirmed**. The database checks and locks all affected dishes within the confirmation transaction. Insufficient stock rolls the confirmation back; repeating confirmation of an already confirmed order does not deduct twice. Confirmation records the staff UUID and time. The Orders screen lists the oldest 100 pending orders; refresh after confirming to load more. Pending orders do not reserve portions, so a later confirmation can fail if another order consumed the remaining stock.

`V6__menu_editing.sql` adds menu photos, stock counts, edit versions, and confirmation audit fields. It is applied to the configured project. If a staff page was open during the update, close its editor and click **Refresh menu** before editing again.

The **Inventory / Add item** form no longer includes photo upload or preview. Existing inventory photos and backend photo-upload support remain available. The backend limits images to 2 MB and 12 megapixels, validates and re-encodes them to discard metadata, and saves an uploaded photo, item, and opening stock movement together. Photos are stored in the database's `inventory_photos` table, with RLS and revoked browser-role privileges; viewing a photo requires staff authentication. This bounded database storage works without additional storage credentials. A larger image catalogue should move to object storage.

Flyway applies `V4__staff_inventory.sql` and `V5__inventory_photos.sql` on backend startup. Both are applied to the configured project. Staff layouts use container-based breakpoints, mobile navigation, wrapping inventory cards, and scrollable dialogs. They were checked at 320, 375, 768, 1024, 1440, and 1920 px, plus a 640 × 320 landscape frame.

The optional database integration test uses the configured database, runs normal startup migrations, and rolls its test item, movement, and photo back. Enable it only when intending to test that database:

```powershell
cd backend
$env:SUPABASE_INTEGRATION_TESTS='true'
mvn test
Remove-Item Env:SUPABASE_INTEGRATION_TESTS
```

## Store status and home sections

Staff can open or close ordering from the dashboard. Closing blocks new checkout requests at the backend; pending orders can still be confirmed. Status persists through `V7__store_status.sql`, applied to the configured project on 9 September 2026. Displayed opening hours do not automatically open or close the store.

Home contains the hero, history/about, feedback, and contact sections. The old `/about` and `/feedback` routes redirect to the matching home anchors. Footer links lead to the privacy and ordering policy. Owner review of policy wording and historical claims remains required before public release.

The September home/store changes still require browser checks at 320, 375, 768, 1024, and desktop widths; earlier inventory layout checks do not verify these new changes. See [the current handoff](docs/CONTINUE-HERE.md).

## Verify

```powershell
cd backend; mvn test
cd ../frontend; npm test -- --watch=false; npm run build
```
