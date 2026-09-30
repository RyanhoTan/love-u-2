# Phase 54 — Make App Favorites grids failure-safe

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-MEMORY-001 includes real story/media favorite behavior and honest failure handling.
- `app/components/album/favorites-stories.tsx`, `favorites-photos.tsx`, and `favorites-videos.tsx` only show a toast when their GET fails, then render successful-empty copy because their arrays remain empty.
- `app/components/album/favorites.tsx` conditionally mounts exactly one grid for the selected Stories/Photos/Videos subtab; switching tabs unmounts the previous grid.

## Objective

Make each App Favorites grid distinguish loading, failed, and successfully empty reads.

## Scope

- Add visible loading and retryable error states to favorites story, photo, and video reads.
- Render each existing empty message only after its corresponding existing GET succeeds.
- Ignore stale results after a retry or after a grid unmounts during subtab navigation.
- Preserve successful list rendering, media-type filtering, navigation, and image/video viewers.

## Non-goals

- No changes to favorites create/update semantics, story detail, other album views, API, server, authorization, database, or media storage.
- No new dependencies, test framework, device, API, credentials, database, or R2 access.

## Material decisions

- A toast is insufficient because the list then displays a success-empty message from its initial empty array.
- The three conditionally mounted grids keep independent request state; a failure in one subtab does not change another tab's behavior.
- Use a request sequence and effect cleanup because switching Favorites subtabs unmounts their grid components.

## Acceptance criteria

- Each grid shows an accessible loading indicator until its GET succeeds or fails.
- A failed GET displays an accessible error and “重新加载”; it does not display the successful-empty text.
- A successful empty response still displays the existing empty copy; a retry success renders filtered stories/media.
- A stale request cannot update state after a newer retry or after the grid unmounts.
- App lint, TypeScript check, and `git diff --check` pass; API and favorite semantics stay unchanged.

## Verification plan

- Run `pnpm --dir app lint` and `pnpm --dir app exec tsc --noEmit`.
- Statically review all three loading/error/ready branches, empty-state reachability, retry API targets, media filtering, and stale-request cleanup.
- Do not access a device, API, database, credentials, or R2.

## Results

- All three Favorites grids now distinguish loading, error, and ready states.
- A failed GET shows an accessible error and retry action; it does not fall through to the empty-story, empty-photo, or empty-video copy.
- Successful filtered-empty responses still render their original copy.
- Request IDs prevent stale retry responses from winning, and effect cleanup invalidates requests after subtab unmount.
- Existing favorite APIs, media filtering, routes, and viewers remain unchanged.

## Handoff

Continue the PRD R1/P0 audit; preserve remaining device/live-service limitations.
