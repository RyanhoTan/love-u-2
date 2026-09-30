# Phase 53 — Make App All Media overview failure-safe

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-MEMORY-001 requires album failures to remain distinguishable from successful empty media.
- `app/components/album/all-medias.tsx` requests completed wishes, album media, and stories concurrently. If any request fails, it only shows a toast and continues rendering three empty arrays, including “还没有照片或视频”.
- Phase 50 established explicit App story read states; Phase 52 established the corresponding photo/video tab behavior.

## Objective

Make the App All Media overview show its content and empty-media copy only after all of its existing reads succeed.

## Scope

- Add visible loading, accessible retryable error, and ready states for the existing parallel read of wishes, album media, and stories.
- Treat the overview as one atomic read: one rejected request prevents all three result sets from rendering as authoritative.
- Ignore stale responses after retry, screen blur, or a later upload refresh.
- Keep the existing APIs, grouping, navigation, media viewers, and successful content layout unchanged.

## Non-goals

- No changes to Photos/Videos tab semantics, Favorites, stories, uploads, API, server, authorization, database, or media storage.
- No new dependencies, test framework, device, API, credentials, database, or R2 access.

## Material decisions

- A toast is insufficient because the underlying empty arrays still render as if all reads had succeeded.
- The overview depends on three datasets; showing a partial mixture would introduce unapproved partial-success semantics, so any failure gates the whole overview.
- Keep upload refresh behavior while limiting refresh-key reads to the focused navigation screen; the nested TabView selection is not changed in this phase.
- Reuse a request sequence and focus cleanup to suppress stale results.

## Acceptance criteria

- Initial request displays loading UI, not wish/story/media content or successful-empty copy.
- Any failed request displays an accessible error and “重新加载”; it does not render an empty overview.
- Retry success renders all returned datasets; only successful all-empty results reach the existing media-empty message.
- Focus cleanup and request IDs prevent older request results from replacing a retry or later focused load.
- App lint, TypeScript check, and `git diff --check` pass; API, relationship authorization, and successful viewers/navigation remain unchanged.

## Verification plan

- Run `pnpm --dir app lint` and `pnpm --dir app exec tsc --noEmit`.
- Statically inspect Promise.all failure behavior, loading/error/ready branches, empty-copy reachability, retry, refresh-key/focus sequencing, and stale response protection.
- Do not access a device, API, database, credentials, or R2.

## Results

- The overview now distinguishes loading, error, and ready states for its parallel wishes/media/stories request.
- A failure from any one request shows a visible retryable error and hides all three unconfirmed datasets.
- Successful responses render the existing content; the media-empty copy is reachable only after the full Promise.all succeeds.
- Retry, upload refresh, and navigation focus cleanup use request IDs so stale responses cannot overwrite newer results.
- Existing API, relationship scope, navigation, grouping, and image/video viewers are unchanged.

## Handoff

Continue the PRD R1/P0 audit; keep Favorites and live-service validation gaps visible.
