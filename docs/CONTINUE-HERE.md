# Continue here — 8 September 2026

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
