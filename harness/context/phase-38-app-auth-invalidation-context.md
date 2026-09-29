# Phase 38 context — Clear invalid App auth sessions

## Observed baseline

- App shared `request()` discards HTTP status and throws `Error(message)`.
- App `requestWithAuth()` obtains an explicit or stored token and adds `Authorization`, but has no 401 handling.
- The AuthProvider owns the in-memory token/user state; it restores and persists sessions through AsyncStorage using a current and legacy key.
- Current and legacy auth-session mutations are now serialized in a shared helper, while restoration remains a read followed by normal validation.
- Web already has a status-aware `ApiError` and invalidates only if the stored token equals the token that received 401.

## Scope rules

- Clear only on HTTP 401 from `requestWithAuth`.
- Compare the failed token against current persistent and in-memory tokens.
- Serialize writes/deletes within this process to guard an in-flight older request racing a new login.
- Do not invalidate on 403, transport exceptions, or server failures.
- A rejected request token must match both the current stored token (for deletion) and current Provider token (for memory invalidation).

## Unresolved / deferred

- Native WebSocket HTTP upgrade failures are surfaced as generic close events; REST status-aware invalidation does not cover them.
- Device/runtime verification is unavailable; only static checks and deterministic token-match logic can be exercised here.
