# Phase 50 — Make App album story reads failure-safe

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-MEMORY-001 requires real stories and shared media to be viewable without disguising failures as success.
- `app/app/home/album/stories/index.tsx` showed a toast on `getAlbumStories` failure, then displayed “还没有时光故事” because the list remained empty.
- `app/app/home/album/stories/[id]/index.tsx` showed a toast on `getAlbumStory` failure, then displayed the successful-empty copy “这个故事里还没有媒体”.

## Objective

Make both App story list and detail distinguish loading, query failure, and a successful empty response, with a recovery action.

## Scope

- Add explicit visible error state and retry to story list and detail queries.
- Keep their existing loading UI and success-empty copy, shown only after successful responses.
- Ignore responses from requests superseded by retry or screen blur.
- Keep successful story rendering and favorite updates unchanged.

## Non-goals

- No story create/edit, favorites behavior, API/server/database or authorization change.
- No changes to generic media viewers, upload flow, story taxonomy, or “敬请期待” actions elsewhere.
- No new dependency, test framework, device, or live-service test.

## Material decisions

- A toast is not enough because the screen continues showing a successful empty state after the error disappears.
- The empty story/message copy is authoritative only after a successful query.
- Reuse a request-sequence ref and focus cleanup to prevent an old screen request from repainting after navigation or retry.

## Acceptance criteria

- Story list request failure shows an accessible error and retry; “还没有时光故事” only follows a successful empty response.
- Story detail request failure shows an accessible error and retry; “这个故事里还没有媒体” only follows successful story data with no media.
- Loading remains explicit; a successful retry renders real returned data.
- A stale request cannot override a newer request or a blurred screen.
- App lint, TypeScript check, and `git diff --check` pass; API and favorite semantics stay unchanged.

## Verification plan

- Run `pnpm --dir app lint` and `pnpm --dir app exec tsc --noEmit`.
- Statically review list/detail loading, error, retry, success-empty, request sequencing, and focus cleanup branches.
- Do not access a device, API, database, credentials, or R2.

## Results

- Story list and detail now have separate loading, retryable error, and successful-data branches.
- Network failures no longer fall through to the empty-story or empty-media messages.
- Both screens use request IDs and focus cleanup so a stale request cannot overwrite a retry or later focus result.
- Successful favorite updates and successful empty responses retain their previous behavior.

## Verification results

- Passed `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- Static review confirmed the empty messages are reachable only outside loading/error branches, retry invokes the existing read API, and focus cleanup invalidates older requests.
- No device, API, database, credentials, or R2 was accessed.

## Handoff

Continue with independent PRD R1/P0 gaps; keep the no-device/live-service validation limitation visible.
