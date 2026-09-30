# Phase 52 — Make App album photo/video tabs failure-safe

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-MEMORY-001 requires honest media failure behavior; failed reads must not be presented as an empty album.
- `app/components/album/photos.tsx` and `videos.tsx` show a toast after `getAlbumMedia` fails, then render “还没有照片/视频” from their empty initial states.
- Phase 50 established App loading/error/retry and request-sequence behavior for album story reads.

## Objective

Make the App album photo and video tabs distinguish loading, failed, and successful-empty media reads.

## Scope

- Add visible loading and retryable error states to the photo and video tabs.
- Render their existing empty copy only after `getAlbumMedia` succeeds.
- Suppress stale results after focus changes, upload refreshes, or a retry.
- Keep the existing `refreshKey` upload-refresh behavior, monthly grouping, media viewers, and read API unchanged.

## Non-goals

- No changes to the All Media overview, favorites views, stories, uploads, API, server, authorization, database, or media storage.
- No new dependencies, test framework, device, API, credentials, database, or R2 access.

## Material decisions

- A toast is insufficient because each tab continues to present its success-empty copy after the error toast disappears.
- Only a successful response with no matching media may show “还没有照片/视频”.
- Bind the refresh-key refresh to screen focus so inactive scenes do not start an invisible request; cleanup invalidates in-flight reads on blur.
- Use an incrementing request ID so retries and refreshes cannot be overwritten by older responses.

## Acceptance criteria

- Initial load displays a visible accessible loading indicator and does not show empty-state copy.
- A rejected request displays a visible accessible error and “重新加载” action, not the empty state.
- Retry success renders grouped media; successful empty results render the original empty copy.
- Upload refresh still reloads the currently focused photo/video view.
- Requests from a prior retry or blurred focus cannot update the current view.
- App lint, TypeScript check, and `git diff --check` pass; grouping and viewer behavior are unchanged.

## Verification plan

- Run `pnpm --dir app lint` and `pnpm --dir app exec tsc --noEmit`.
- Statically inspect focus/refresh-key behavior, loading/error/ready branches, successful-empty reachability, retry, and stale request protection.
- Do not access a device, API, database, credentials, or R2.

## Results

- Photo and video tabs now distinguish loading, error, and successful responses; their empty copy appears only after a successful filtered response.
- Errors are visible and retryable. Failed reads no longer leave a false empty-album message.
- Focus cleanup invalidates in-flight requests; retry and focused upload-refresh requests use monotonically increasing IDs so earlier responses cannot overwrite newer state.
- `refreshKey` changes trigger refresh only for the focused scene; returning to a scene reloads the current data.
- Existing monthly grouping, media viewers, and `getAlbumMedia` contract are unchanged.

## Handoff

After evidence and the independent commit, continue the PRD R1/P0 audit; keep remaining album view and live-service gaps visible.
