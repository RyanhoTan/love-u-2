# Phase 52 context — App album photo/video tab states

## Observed baseline

- The App Photos and Videos components call `getAlbumMedia` on focus and after upload refreshes.
- Both catch handlers only show a toast and leave the data arrays empty; normal rendering then shows “还没有照片” or “还没有视频”.
- The `refreshKey` effect and focus effect can invoke overlapping reads. Neither component currently suppresses late responses or invalidates requests on blur.
- Phase 50 provides a matching request-sequence pattern for album story reads.

## Decision

- Add explicit loading/error/ready state and a retry action in both views.
- Tie refresh-key changes to the focused view and invalidate requests on blur.
- Let only a successful, filtered empty response reach the existing empty copy.

## Implemented behavior

- Both tabs now short-circuit to loading or accessible error/retry UI until the current `getAlbumMedia` request succeeds.
- Photo/video empty copy is reachable only after successful retrieval and media-type filtering.
- A focus ref and previous refresh-key ref keep upload refreshes targeted to the focused view; focus cleanup invalidates in-flight requests.
- Request IDs suppress stale responses from retries, refreshes, or earlier focus sessions.

## Unresolved / deferred

- The App package has no configured UI test runner; behavior will be checked with lint, TypeScript, and static review, not on-device interaction.
- All Media and Favorites views continue to have separate failure-state gaps outside this phase.
- Real API/R2 behavior is not exercised.
