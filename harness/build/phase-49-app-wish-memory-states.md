# Phase 49 — Make App wish memories failure-safe

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001 requires process-record media to remain viewable as shared memories and reliable failure behavior.
- `app/app/home/wish-list/[id]/memory.tsx` starts with empty records and renders the memory page immediately. A failed `getWishRecords` only shows a toast, leaving the page to display zero counts and “暂无记录”.
- App Wish detail and edit screens already demonstrate explicit loading/error/retry UI patterns.

## Objective

Make the App wish memory page distinguish a confirmed empty records response from an in-flight or failed request, and give users a retry path.

## Scope

- Add `loading | ready | error` state for the existing wish-record request.
- Render the gallery/statistics only after a successful response.
- Render a visible, accessible loading state and an error with a retry action.
- Ignore stale request results when the page loses focus or a newer retry starts.
- Derive “最近一次记录” only from an actual record date, not the wish's general `updatedAt` timestamp.
- Keep existing invalid-ID back behavior and image/video viewers.

## Non-goals

- No API/server/data changes, new record or media behavior, or lifecycle policy.
- No feature work for Share/Ellipsis menu actions or `敬请期待` placeholders.
- No dependency, test framework, or database/object-store integration.

## Material decisions

- A toast is insufficient because the screen continues showing an empty gallery; failure must replace the gallery with a retryable state.
- Successful response with zero records is the only condition that may render the empty-record message and zero counts.
- Reuse a monotonically increasing request token so a previous focus request cannot overwrite a later result after navigation/retry.

## Acceptance criteria

- Initial request shows a loading indicator/message and not placeholder gallery data.
- Failed request shows an accessible error plus “重新加载”; it does not show zero-count statistics or “暂无记录”.
- Retry success displays the actual wish and records; a retry failure remains in the error state.
- A successful empty response still displays the real empty state.
- An empty response does not present a wish-edit timestamp as the latest record date.
- App lint, TypeScript check, and `git diff --check` pass; API/media behavior is unchanged.

## Verification plan

- Run `pnpm --dir app lint` and `pnpm --dir app exec tsc --noEmit`.
- Statically review loading/error/ready branches, focus cleanup, stale request protection, retry, and the success-only empty state.
- Do not access a device, API, database, credentials, or R2.

## Results

- The page now has `loading | ready | error` states. It renders the memory gallery and real empty-record state only after `getWishRecords` succeeds.
- Failed requests replace the gallery with an accessible error and “重新加载” action. Retry uses the same API call.
- Request IDs prevent a stale result from a previous focus or retry from replacing newer state.
- “最近一次记录” now uses only the last record's date; wish `updatedAt` no longer masquerades as a record date.
- Invalid wish-ID behavior, viewers, and server/media contracts are unchanged.

## Verification results

- Passed `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- Static review confirmed gallery/zero stats render only in `ready`, empty text is only shown for a successful empty response, failures expose retry, and stale requests are ignored.
- No device, API, database, credentials, or R2 was accessed.

## Handoff

Continue with independent PRD R1/P0 gaps; keep device and live-service validation limits visible.
