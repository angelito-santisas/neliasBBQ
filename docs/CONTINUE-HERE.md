# Continue here — 9 September 2026

## Current checkpoint (supersedes the historical notes below)

Repository delivery: these changes and [the 9 September session log](session-recap-2026-09-09.md) are included in the follow-up commit for main. Earlier local/unpushed notes below describe the state before this delivery.

### Feedback order-number requirement

- Removed Submit Anonymously and replaced it with a required order-number input. Accepts the 8-character checkout number or the full UUID, case-insensitively. Unknown/malformed numbers are rejected; ambiguous short numbers require the full UUID.
- Feedback is linked to an existing order. The service locks that order before checking for previous feedback, and V9 adds a unique order reference as a database safeguard. Repeated submissions return HTTP 409: "Feedback has already been submitted for this order number."
- Existing feedback is preserved with a null order reference; V9 requires an order reference for new entries. The legacy anonymous column remains for historical compatibility, but is no longer accepted by the request/form.
- The form resets after success, prevents double submission while saving, and displays server errors inline. README and privacy text now describe order-linked feedback.
- Frontend build and 19 tests passed. Backend clean verify passed: 30 passed, 6 opt-in integration tests skipped. V9 was applied through Flyway; both feedback database integration tests passed using synthetic rows rolled back afterward. The updated backend was started as PID 16548, superseding earlier PIDs below. Visual browser checks remain pending; changes remain local and unpushed.

### Staff Orders and Store follow-up

- Updated backend left running on port 8080, PID 4504 (supersedes earlier PIDs below).
- Staff refresh buttons were removed. Menu, Orders, and inventory/overview update every 15 seconds while visible and on focus, reconnect, and returning to the tab. Requests time out after 10 seconds and retry on the next update. Edits/actions pause polling; old inventory responses cannot replace a newer save. Store uses the existing shared availability polling.
- Orders now supports server-side search by short or full order ID across all pending orders, returning up to 100 matches. Search is debounced and retained during automatic updates; stale search responses are discarded. Confirmed/cancelled order history is not part of this pending-order search.
- Automatic-refresh/search tests passed: 17 frontend tests, 26 backend unit/security tests, plus a separate read-only Supabase order-search integration test. The database check passed without creating or changing customer orders. Backend packaging passed. Browser checks remain pending.

- `/staff/orders` provides Confirm order and Cancel order for pending orders. Cancellation retains the order, records staff/time, and leaves stock unchanged. Cancel and confirm acquire the same order lock; cancelled orders cannot be confirmed, confirmed orders cannot be cancelled, and cancellation retries retain the original audit fields.
- `/staff/store` contains the open/close control, removed from other staff sections. All staff workspace sections now use guarded routes; inventory shortcut filters are carried in the URL.
- Customer-facing status badges/cards and refresh/closure notices were removed as requested; menu item buttons still show Store closed and ordering restrictions remain active.
- Flyway applied V8 successfully on 9 September. Restarted backend PID **18996** returned health UP; anonymous cancellation returned 401. This PID supersedes the older runtime note below. No real customer order was cancelled or created for verification.
- Verification: backend clean verify passed (25 passed, 3 integration tests skipped); frontend build and 15 tests passed, including cancellation success/failure, competing-action prevention, and direct staff navigation.
- Browser discovery still returned no connected browsers. Responsive visual checks and real authenticated interactions remain pending. These follow-up changes are local and have not been committed or pushed.

### Earlier verification

- Initial allowance check: the current session record showed 97% of the five-hour allowance remaining. Continue respecting the stop-below-10% rule; never consume account reset credits automatically.
- No Java backend was listening on 8080 at initial inspection. `mvn clean verify` succeeded, including JAR repackaging; the previous JAR-lock issue is resolved.
- Started the backend and let Flyway apply V7 to the configured Supabase database. Logs confirmed V6 -> V7. No manual migration was run.
- Health returned UP, GET `/api/v1/store` returned `{"open":true}`, and anonymous PUT `/api/v1/staff/store` returned 401 without changing business status.
- Restarted the backend: Flyway reported V7 up to date, health remained UP, and status remained open. This verifies existing status across restart, not persistence of a staff toggle.
- Added server tests for public status access, anonymous mutation rejection, authenticated mutation with mocked authentication/service boundaries, and empty/missing/null status rejection. Backend verification passed: **20 passed, 3 opt-in database integration tests skipped**.
- Fixed cart quantity buttons and special instructions remaining editable during checkout. Increase also disables when ordering is unavailable or the stock limit is reached.
- Added checkout regression tests for disabled controls during checking/submission, duplicate-submission prevention, and cart retention/unlocking after failure.
- Added a regression test proving an older heartbeat cannot overwrite a completed staff closure, including authorization-header and duplicate-toggle checks.
- Frontend verification: **12 tests passed across 5 files; production build passed**.
- Updated README descriptions for inventory photos, shared availability checks, migrations, store status, and home sections.

## Remaining work

1. Connect a browser. Runtime setup succeeded, but selection reported no browser available and discovery returned an empty list. No responsive screenshots, keyboard checks, or authenticated browser checks were possible. **Do not call the UI complete.**
2. Verify real staff sign-in, store toggling, changed-status persistence after restart, and direct closed-store checkout rejection using controlled data or a local test database. Automated security tests mock authentication/service boundaries. Do not casually close the business or create real customer orders.
3. Perform the two-session checks in historical steps 5–7 below, including all five responsive widths, background recovery, failed connections, navigation/anchors, feedback, contact links, and keyboard focus. Automated tests cover some scenarios, but do not replace these browser checks.
4. Owner review of policy wording and historical/about claims remains required before public release.

## Current runtime

Backend left running on port 8080, PID 5732 at this checkpoint, from `target/backend-0.0.1-SNAPSHOT.jar`. Verify current PID/command line before stopping it; stop only the matching backend before repackaging. An existing frontend listener was found on port 4200, PID 13024; it was not restarted.

User-scope JAVA_HOME was absent, but `java.exe` and `mvn.cmd` were available on PATH. Java resolved to the local Eclipse Adoptium JDK 17 installation. Only copy JAVA_HOME/MAVEN_HOME from user settings when their values exist. Preserve the ignored root `.env`; never commit runtime logs or build outputs. A Git push does not deploy the application.

---

## Historical handoff — 8 September 2026

## Why work stopped

The user requested that development stop when the five-hour Codex allowance falls below 10%, followed by a GitHub push and this handoff. The account rate-limits endpoint reported 91% used / **9% remaining**. Feature development stopped at that checkpoint. Recheck the allowance before continuing; do not consume any account reset credits automatically.

## Implemented in this checkpoint

- Staff store open/close button on the dashboard. Public status is `GET /api/v1/store`; authenticated changes use `PUT /api/v1/staff/store` with `{ "open": true/false }`.
- `V7__store_status.sql` persists store status and audit fields, enables RLS, and revokes direct browser-role access. Initial status is open to preserve existing ordering behavior. This migration has **not been applied or tested against Supabase in this session**.
- Checkout checks store status on the backend within its transaction. Closing the store pauses new orders; pending orders may still be confirmed.
- Home sections now appear in order: hero, existing history/about content, feedback form, store contacts. About and Feedback were removed from primary navigation; old routes redirect to home anchors.
- Contact details supplied by the owner: Area C Bernardo Comp., Solidarity St., Annex 29–32, Betterliving, Brgy. Don Bosco, Parañaque City; 0968 609 2324; asantisas7@gmail.com; https://fb.com/nisa.santisas.07; 5 PM–8 PM Philippine time. These hours are displayed, not an automatic store schedule.
- Shared availability checks run every 15 seconds while the page is visible, plus on focus, returning to the tab, and reconnecting. Cart checkout refreshes availability before sending the order; the backend also validates stock.
- Removed/unpublished cart products remain visible for review/removal rather than silently disappearing from the submitted order. Unknown stock or failed availability checks block ordering.
- Removed the "Added ... to your order" toast. Feedback, order-submission, and staff notifications remain.
- Removed photo upload and preview from Add inventory item. Existing inventory photos and backend photo support remain; menu photo upload remains.
- Added copyright, privacy/ordering policy page, footer links, contact links, and responsive section styles.
- Included the existing local README setup instructions and Angular style-budget settings. The local `.env`, `.codex/` settings, build output, and runtime logs are not part of this checkpoint.

## Verification results

- `frontend`: `npm.cmd run build` passed.
- `frontend`: `npm.cmd test -- --watch=false` passed, 10 tests. Includes shared polling, removed products, store closure, and network-failure cases.
- `backend`: compilation and tests passed: 18 passed, 3 opt-in Supabase integration tests skipped.
- `mvn verify` then failed during Spring Boot repackaging: Windows could not rename `target/backend-0.0.1-SNAPSHOT.jar` to `.jar.original`. A backend was previously started from this JAR (PID 36724 at the time). Check current processes before stopping anything; a running Java process may hold the JAR open.
- No new live migration, staff-toggle, authenticated browser, or responsive browser verification was completed. Previously, no browser was connected to the browser tool.

## Next steps, in order

1. Check the five-hour allowance. Continue development only when the user's threshold permits it.
2. Inspect port 8080 and the Java command line. Stop only the matching local Nelia's BBQ backend if it is holding the JAR. Run `mvn clean verify` from `backend/`, then start the updated backend. Use `JAVA_HOME` and `MAVEN_HOME` from the Windows user environment if the terminal has an old PATH.
3. Let Flyway apply V7 during startup; do not run the migration manually. Confirm health is UP, and `/api/v1/store` returns the persisted status. The last known live database was already at V6.
4. Verify staff authentication and store toggling end to end. Confirm unauthenticated callers cannot change status; blank/null status requests are rejected; status persists after restart; closed-store order submission is rejected even via direct API calls. Use controlled test data or a local test database; do not create real customer orders or change business status casually.
5. Verify the store switch, menu, and cart together across two browser sessions. Check closure, reopening, sold-out/hidden products, stock reduction, failed connections, background-tab recovery, and a status change during checkout. Check race behavior between a heartbeat response and a staff status save, and cart controls while checkout is in flight.
6. Test home section order, old About/Feedback redirects and anchor scrolling, feedback submission, phone/email/Facebook links, footer policy navigation, and absence of the add-to-cart toast and inventory upload field.
7. **Required before calling the UI complete:** inspect at 320, 375, 768, 1024, and desktop widths. Check horizontal overflow, navigation wrapping, cart controls, store controls, feedback ratings, contact cards, and staff modals. Keyboard-check controls and focus; retain visible focus styles. The new layout is built but not visually verified.
8. Review policy wording and existing historical/about claims with the owner before public release. No new refund rules, data-retention deadlines, or legal-compliance claims were added.
9. Update README's older inventory-photo and menu-only-refresh descriptions to reflect this checkpoint. Finish any fixes found above, rerun affected tests/builds, update this handoff, and push the follow-up.

## Run commands

From a fresh terminal at the repository root:

```powershell
$env:JAVA_HOME = [Environment]::GetEnvironmentVariable('JAVA_HOME', 'User')
$env:MAVEN_HOME = [Environment]::GetEnvironmentVariable('MAVEN_HOME', 'User')
$env:Path = "$env:JAVA_HOME\bin;$env:MAVEN_HOME\bin;$env:Path"
cd backend
mvn clean verify
mvn spring-boot:run
```

In a second terminal, from the repository root:

```powershell
cd frontend
npm.cmd test -- --watch=false
npm.cmd run build
npm.cmd start
```

The local root `.env` already contains private Supabase configuration. Preserve it and never stage it. A source push does not deploy the application or run its migrations.
