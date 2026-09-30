# Phase 62 — Invalidate App sessions on raw media-upload 401

## Status

In progress.

## Source and evidence

- `PRD-AUTH-001` requires expired tokens to clear client sessions and require reauthentication.
- Phase 38 established conditional invalidation for App authenticated API requests: a late 401
  from an old token must not clear a newer session.
- `app/app/shared/api-client.ts` implements that behavior for `requestWithAuth`.
- `app/app/features/album/api.ts` and `app/app/features/wish-list/api.ts` send authenticated
  uploads through raw `fetch`, bypassing the invalidation path. Album upload also serves chat audio.

## Scope

- Add a raw-response authenticated fetch helper to the shared App API client.
- Apply the same 401 cleanup contract as `requestWithAuth`, including stored-token matching
  and in-memory auth notification.
- Migrate the authenticated uploads in the album and wish API modules to the helper.
- Preserve upload endpoint, request body/headers, response parsing, and existing failure feedback.

## Non-goals

- No upload endpoint or server change, retry behavior, new test framework, or user-facing copy change.
- No access to `.env`, credentials, live API, database, object storage, or user data.

## Acceptance

1. Both App authenticated upload paths use the shared 401 invalidation helper.
2. A late upload 401 cannot clear a newer token's stored or in-memory session.
3. Other HTTP statuses and network failures do not trigger auth invalidation.
4. Local file-URI fetches are not routed through the authenticated API helper.
5. App lint, App TypeScript check, source review, and `git diff --check` pass.

## Verification limitation

The App package has no configured unit/UI test runner. No device or live API is available in
this phase, so verification is static source review plus lint/type checking; runtime session
invalidation remains for a future App/API integration test.

## Verification result

- `pnpm --dir app lint`: passed.
- `pnpm --dir app exec tsc --noEmit`: passed.
- `git diff --check`: passed.
- Source search found only two local file-URI fetches plus the two shared API-client fetches;
  all authenticated media uploads now call `fetchWithAuth`.
- No UI/runtime test was run because no App test runner or device/API integration is configured.
