# Phase 53 context — App All Media overview states

## Observed baseline

- `AllMedias` concurrently calls `getWishes`, `getAlbumMedia`, and `getAlbumStories`.
- It assigns results only after `Promise.all` resolves. If any one rejects, all local arrays stay empty and the view falls through to “还没有照片或视频” while wish/story sections also appear empty.
- The screen uses both a navigation-focus request and an upload `refreshKey` effect; no sequencing prevents an older request from overwriting a retry.

## Decision

- Treat the overview as atomic rather than inventing partial-result semantics.
- Show loading/error/ready states, allow a retry through the existing three GETs, and ignore stale results after retry or navigation blur.
- Preserve successful rendering and existing upload-refresh behavior.

## Implemented behavior

- The page has explicit loading/error/ready state for all three parallel reads.
- Any rejection prevents every returned dataset from rendering; retry re-runs the same existing APIs.
- Only the successful ready branch reaches the existing “还没有照片或视频” copy.
- Request sequencing prevents stale results after retry, and focus cleanup invalidates reads after navigation blur.
- Upload refresh continues to use the existing `refreshKey`, but only starts a request while the navigation screen is focused.

## Unresolved / deferred

- The App package has no configured UI test runner; validation will use lint, TypeScript, and static review rather than device interaction.
- Favorites views still conflate some failed reads with successful empty states.
- No live API, database, or R2 integration is exercised.
