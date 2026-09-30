# Phase 56 — Make App wish recycle reads failure-safe

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001 requires the App to support the wish recycle bin and recovery.
- `app/app/home/wish-list/recycle.tsx` currently catches a failed `getDeletedWishes` with a toast, then clears loading while retaining the initial empty array; the screen consequently shows “回收站还是空的”.
- Existing App wish detail/list phases establish visible loading, retryable errors, and stale request suppression as the local pattern for important reads.

## Objective

Distinguish an empty recycle bin from a failed recycle-bin read and allow the user to retry.

## Scope

- Add visible loading, error/retry, and successful-data states around the existing `getDeletedWishes` read.
- Only show the empty-bin copy after the read succeeds.
- Ignore stale reads after a newer retry or screen blur/unmount.
- Preserve existing restore/permanent-delete confirmation, APIs, success feedback, and data semantics.

## Non-goals

- No changes to server/API/database behavior, retention policy, delete authorization, restore, or permanent-delete semantics.
- No new dependencies, test framework, device, API, credentials, database, or object-storage access.
- Do not change the separate primary wish list in this phase.

## Material decisions

- A toast is insufficient because it disappears and the empty state otherwise communicates a false successful result.
- Keep the existing empty copy for a successful empty response; do not infer retention or deletion policy changes.
- Use a request sequence and focus cleanup so an old response cannot overwrite a newer request or a blurred screen.

## Acceptance criteria

- Initial focus visibly indicates loading and does not show empty-bin copy or stale list rows as current data.
- A failed read shows an accessible error and an in-page retry; the empty-bin copy is absent.
- A successful empty read shows the existing empty-bin copy; a successful non-empty read shows the returned wishes.
- Retry and focus changes suppress stale responses.
- Restore and permanent delete still use the same APIs and confirmations, and refresh the list after success.
- App lint, TypeScript check, and `git diff --check` pass.

## Verification plan

- Run `pnpm --dir app lint` and `pnpm --dir app exec tsc --noEmit`.
- Statically inspect loading/error/ready gating, retry, request ordering, focus cleanup, and unchanged mutation handlers.
- Do not access a device, API, database, credentials, or R2.

## Results

- The recycle screen now shows a loading indicator while the server list is being read.
- Read failures render a visible accessible error and retry action; they no longer render the empty-bin message.
- The existing empty copy and wish rows are rendered only after a successful response.
- Request sequence checks and focus cleanup ignore responses from older retries or a blurred screen.
- Restore and permanent-delete flows continue using the same APIs and confirmation dialogs, and still refresh after success.
- Passed `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- Static review covered loading/error/ready branches, retry, request sequencing, focus cleanup, and unchanged mutation handlers. No device or live service was exercised.

## Handoff

Continue the active PRD R1/P0 audit while keeping live integration limitations visible.
