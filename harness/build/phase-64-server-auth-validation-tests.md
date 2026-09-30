# Phase 64 — Cover server bearer/JWT identity validation

## Status

Complete.

## Source and evidence

- `PRD-AUTH-001` requires invalid/expired credentials to be rejected consistently.
- Protected REST handlers call `getAuthenticatedUserId`; partner-chat WebSocket authentication
  uses `verifyAuthToken`.
- `server/src/auth.ts` validates the Bearer header, JWT signature/expiry, subject, and positive
  integer user ID, but had no direct repeatable tests for those rejection paths.
- Importing `auth.ts` loads configuration and requires a JWT secret; tests must avoid `.env` and
  production credentials.

## Scope

- Extract pure Bearer parsing, token verification (secret passed explicitly), and user-ID
  extraction helpers; preserve existing production wrappers and response semantics.
- Add Node tests using a synthetic key for missing/malformed headers, invalid/expired JWTs,
  missing/blank subject, and invalid user IDs.
- Do not import server config or establish a database/network connection in the tests.

## Non-goals

- No JWT claims/algorithm/lifetime policy change, auth API change, rate limiter, or integration
  server setup.
- No `.env`, credentials, live accounts, database, or user data access.

## Acceptance

1. Existing REST and WebSocket call sites use the unchanged production `verifyAuthToken` wrapper.
2. Valid synthetic Bearer/JWT inputs resolve to the expected user ID.
3. Missing/malformed Bearer header, bad signature, expired JWT, invalid subject, and invalid ID
   consistently throw `HttpError(401, "invalid or expired token")`.
4. Tests import no config module and use only an in-memory synthetic key.
5. Server tests, lint, build, and `git diff --check` pass.

## Verification limitation

These unit tests establish local parsing/verification behavior, not route middleware ordering,
HTTP response wiring, MySQL access control, or live WebSocket rejection. Those require a safe
server integration fixture not currently configured.

## Verification result

- `pnpm --dir server test`: passed, 28 tests across 13 suites.
- `pnpm --dir server lint`: passed.
- `pnpm --dir server build`: passed.
- `git diff --check`: passed.
- Source review confirmed existing REST handlers and WebSocket authentication retain the same
  `getAuthenticatedUserId` / `verifyAuthToken` production entry points.
- Test imports are limited to the pure auth module and `HttpError`; no config, `.env`, DB, or
  network connection is loaded.
