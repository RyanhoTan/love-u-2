# Phase 61 — Map concurrent duplicate registrations to conflict

## Status

Complete.

## Source and evidence

- `PRD-AUTH-001` requires usable account registration and clear failure behavior.
- `server/src/router_handler/user.ts` checks for an existing username before insert.
- `server/src/db/schema.ts` defines `UNIQUE KEY uniq_users_username (username)`.
- `server/src/app.ts` converts `HttpError` to its declared HTTP status and unknown errors to 500.

The pre-insert check improves the common duplicate path but cannot prevent two concurrent
requests from both passing the check. The unique index correctly prevents duplicate rows;
this phase makes that race return the same 409 conflict as the pre-check.

## Scope

- Keep the existing username lookup and database unique index unchanged.
- Catch only the user-row `INSERT` failure and map MySQL `ER_DUP_ENTRY` to the existing
  `HttpError(409, "username already exists")` response.
- Rethrow all other insert errors so the existing internal-error path is preserved.
- Add focused tests for MySQL duplicate error classification.
- Update the PRD baseline and workflow evidence.

## Non-goals

- No schema, API, client, or error-message contract changes.
- No account enumeration policy redesign, rate limiting, or registration integration test.
- No live database, credentials, or user data access.

## Acceptance

1. Sequential duplicate registration remains a 409 using the existing message.
2. A duplicate-key error from the insert race is translated to that same 409.
3. Non-duplicate insert failures are rethrown and remain eligible for the global 500 path.
4. The classifier has unit coverage for `ER_DUP_ENTRY`, other codes, and malformed values.
5. Server tests, lint, build, and `git diff --check` pass.
6. Source review confirms only the insert is inside the duplicate-error catch.

## Verification limitation

The test suite has no configured MySQL integration environment. This phase validates the
classifier and statically reviews the route wiring; the actual concurrent HTTP/DB race is
not exercised against a live MySQL server.

## Verification result

- `pnpm --dir server test`: passed, 22 tests across 10 suites.
- `pnpm --dir server lint`: passed.
- `pnpm --dir server build`: passed.
- `git diff --check`: passed.
- Source review confirmed only the users `INSERT` is inside the duplicate-error catch.
