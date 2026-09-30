# Phase 63 — Preserve App sessions on transient restore failures

## Status

Complete.

## Source and evidence

- `PRD-AUTH-001` requires restoring valid sessions and clearing invalid tokens.
- Phase 38/62 define token-matched invalidation for authenticated App requests.
- `getUserInfo` uses `requestWithAuth`, which removes the session only when the server returns 401.
- `AuthProvider.restoreSession` previously removed the stored session for every thrown error,
  including network failures and server errors.

## Scope

- Keep clearing malformed serialized session data and entries without a usable token/user.
- Let the authenticated API client's 401 path clear an explicitly rejected token.
- Preserve the stored session for non-401 API/network/storage errors.
- If a cached identity has a valid positive ID and username, restore the local identity/token
  after a non-401 profile verification failure; server APIs continue enforcing authorization.
- Record the behavior and verification limitation.

## Non-goals

- No server/JWT changes, offline business-data cache, retry scheduler, or new UI framework.
- No live API, credentials, database, or user data access.

## Acceptance

1. Valid persisted sessions still refresh identity from the server on startup.
2. Malformed serialized state or missing/invalid token is removed.
3. A 401 continues to invalidate only the rejected token and does not restore cached identity.
4. Other API/network failures do not delete a stored token; a structurally valid cached user
   can remain locally signed in until server requests recover.
5. App lint, TypeScript check, source review, and `git diff --check` pass.

## Verification limitation

The App package has no configured test runner. Runtime network-failure injection and device
restore behavior are not exercised; verification is static source review plus lint/type checking.

## Verification result

- `pnpm --dir app lint`: passed.
- `pnpm --dir app exec tsc --noEmit`: passed.
- `git diff --check`: passed.
- Static review confirmed malformed session JSON and missing/empty tokens are removed; the
  shared 401 path clears a matching rejected token; non-401 failures preserve storage and use
  only a structurally validated cached identity when available.
- No network-failure injection, App runtime, or device test was run because no such test
  environment is configured.
