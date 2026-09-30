# Phase 44 context — Web wish status progression

## Observed baseline

- `WishStatus` and server validation already define `todo`, `doing`, and `done`.
- App detail transitions a `todo` wish to `doing`; its doing route supports completion to `done`.
- Web detail exposes a completion dialog for every non-done wish, so a `todo` wish can skip `doing`; the header also offers completion on already-done wishes.
- `useUpdateWishMutation` already refreshes the active list, detail, and records after a successful PATCH.

## Decisions

- Match the existing App progression for forward actions: `todo` starts, `doing` completes, `done` has no further action.
- Use the existing server PATCH and cache behavior; do not add new status semantics.

## Implemented behavior

- Todo state directly PATCHes `doing` and reports a failure instead of implying success.
- Doing state opens the completion dialog and only changes to `done` after confirmation.
- Done state has no forward action; stale completion query parameters are removed unless the current wish is doing.
- Existing update mutation invalidates detail/list/record queries.

## Unresolved / deferred

- Whether completed wishes may be reopened is not specified by the PRD and is not changed here.
- No live browser/API integration or dedicated Web unit-test infrastructure is available.
