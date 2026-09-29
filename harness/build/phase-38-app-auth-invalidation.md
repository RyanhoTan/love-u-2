# Phase 38 — Clear invalid App auth sessions

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-AUTH-001 requires expired/invalid tokens to clear local sessions and require sign-in.
- Web `requestWithAuth` already invalidates only the matching browser token on HTTP 401.
- App `requestWithAuth` throws plain `Error` for every non-2xx response and does not clear `AsyncStorage` or AuthProvider memory state.
- App requests can pass an explicit token while another session may be written, so a late response for an older token must not clear a newer login.

## Objective

Make App authentication recover consistently from server-confirmed token invalidation: a protected API 401 for the active persisted token clears both persisted and in-memory auth, while stale requests cannot log out a newer session.

## Scope

- Preserve HTTP status on App API errors.
- Centralize and serialize App auth-session persistence/removal.
- On 401, remove persisted keys only when the stored token still matches the rejected request token.
- Notify AuthProvider to clear in-memory token/user only when its current token matches the rejected token.
- Apply to every App API request routed through `requestWithAuth`, including explicit token overrides.

## Non-goals

- No changes to Web auth behavior, server JWT expiry policy, login error wording, token lifetime, refresh tokens, or protected-resource authorization.
- No logout on 403, network failure, JSON parse error, or 5xx.
- No automatic login retry or token refresh.
- No access to a live server, database, credentials, or user account.

## Material decisions

- Use compare-before-delete by token and serialize session writes/removals through one in-process queue, so an old 401 cannot remove a session saved after it.
- Notify the active AuthProvider only after observing a 401; the provider separately compares its current token to prevent stale in-flight responses from changing current auth state.
- If storage removal fails, clear matching in-memory auth anyway; the next app restore will revalidate the stored token and existing restore failure handling removes it.
- Preserve both current and legacy storage-key cleanup behavior.

## Acceptance criteria

- A 401 for the currently stored token clears current and legacy persisted session keys and clears AuthProvider token/user state.
- A 401 from an older token does not remove or clear a newer persisted/in-memory session.
- 403, network errors, and 5xx do not clear auth state.
- Existing API callers still receive a normal `Error`-compatible error with the original server message and now-available status.
- App lint, direct TypeScript check, and `git diff --check` pass.
- A pure compare-token matrix covers matching, mismatching, and absent stored tokens.

## Verification plan

- Run `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- Run a small deterministic matrix against the pure token-match guard.
- Static-review serialized storage operation order and AuthProvider token comparison.
- Do not claim a real 401 redirect or storage behavior on device without integration access.

## Results

- App API failures now preserve HTTP status in an `ApiError`; `requestWithAuth` handles only status 401 and rethrows the original error afterward.
- Auth storage reads/persist/remove operations share a serialized mutation queue. A 401 removes the current and legacy keys only if the stored token still matches the rejected token.
- AuthProvider listens for invalidation and clears its in-memory token/user only if its current token still matches. `refreshUser` also checks after awaiting its request so a stale successful response cannot restore an invalidated token.
- 403, network failures, and 5xx do not enter the invalidation path.

## Verification results

- Passed: `pnpm --dir app lint`
- Passed: `pnpm --dir app exec tsc --noEmit`
- Passed: `git diff --check`
- Passed: 4-case pure guard matrix for matching token, stale request, absent stored token, and empty stored token.
- Static review confirmed all current/legacy auth storage writes/removals route through the serialized helper; AuthProvider performs reads only during restoration. No live API/device auth session was exercised.

## Risks and limitations

- AsyncStorage failures can prevent durable deletion; memory still clears, and restore-time validation retries cleanup on next launch.
- Multiple app processes are not covered by an in-process mutation queue; the Expo app runs as one process in the supported client model.
- WebSocket upgrade failures do not expose an HTTP response status through the current React Native WebSocket abstraction and are outside this REST-focused phase.

## Handoff

Complete REST 401 invalidation in App only. Continue PRD-AUTH-001 account/session failure-path review as separate work.
