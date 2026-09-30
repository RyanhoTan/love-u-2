# Phase 51 — Make App wish doing page failure-safe

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001 requires truthful shared-wish status and process records.
- `app/app/home/wish-list/[id]/doing.tsx` only showed a toast when `getWishRecords` failed, then rendered a hard-coded wish title, “暂无记录”, and active wish actions.
- Phase 49 established the App loading/error/retry and stale-request pattern for the same records API.

## Objective

Make the App doing page distinguish a loading request, a failed request, and a successful response so missing data is never presented as a real empty wish.

## Scope

- Add explicit loading, error, and ready states for the existing `getWishRecords` request.
- Show visible loading and retryable error UI; preserve a back action for an invalid route ID.
- Render the wish title, process records, successful-empty copy, finish action, and add-record action only after a successful response.
- Ignore stale requests after a retry or screen blur.
- Keep existing successful record rendering, viewers, and `updateWish` completion behavior unchanged.

## Non-goals

- No API, server, database, authorization, media, or wish-status contract changes.
- No record creation/editing or lifecycle changes; no changes to the completion screen.
- No new dependencies, test framework, device, API, credential, database, or object-store access.

## Material decisions

- A toast alone is insufficient because the page continues to render a fallback title and a successful-empty message after the toast disappears.
- A successful response with zero records is the only condition that may render “暂无记录”.
- Keep wish actions hidden until data is confirmed, so a failed lookup cannot present a false wish as actionable.
- Reuse a request sequence and focus cleanup to prevent an earlier response from replacing retry or navigation state.

## Acceptance criteria

- Initial load presents an accessible loading state and no wish/record content or wish actions.
- Query failure presents an accessible error and a retry button; it does not show hard-coded wish data or the empty-record message.
- A valid retry success renders the response; a successful empty response alone renders the existing empty copy.
- Invalid IDs do not render fabricated wish data and provide a way back.
- A stale request cannot update state after a retry or page blur.
- App lint, TypeScript check, and `git diff --check` pass; successful API, media viewer, and completion semantics remain unchanged.

## Verification plan

- Run `pnpm --dir app lint` and `pnpm --dir app exec tsc --noEmit`.
- Statically inspect loading/error/ready branches, empty-state reachability, action gating, retry, invalid ID handling, and stale request protection.
- Do not access a device, API, database, credentials, or R2.

## Results

- The doing page now distinguishes loading, failure, and successful data. The fallback title and empty-record copy no longer appear when the read fails.
- Retry is available for valid IDs; invalid IDs show an error and a back action.
- Finish and add-record actions only render after a successful wish/record response.
- Request IDs and focus cleanup prevent older results from replacing newer retries or a blurred screen.

## Handoff

Continue the PRD R1/P0 audit; preserve remaining device/live-service limitations.
