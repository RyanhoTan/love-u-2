# Phase 63 context — startup auth restoration

Authenticated App requests conditionally clear a matching stored token on HTTP 401, and the
auth provider clears in-memory state only if that same token is active. Startup restoration
previously had a broader catch that removed the stored session for any failure, undoing that
distinction for transient network/server/storage errors.

The restore flow now treats malformed local serialization or missing credentials as unusable,
lets the shared API client's 401 path handle explicitly rejected tokens, and preserves the
credential on other errors. When possible it restores only the validated last-known identity
shape (positive integer user ID and non-empty username); protected resources remain inaccessible
unless the server accepts the token. This is a local auth-shell fallback, not an offline data
cache or proof that the token is still valid.

No App test runner is configured, so runtime failure injection remains outstanding.
