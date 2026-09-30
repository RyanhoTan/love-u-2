# Phase 44 — Web wish status progression

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001 requires real, consistent wish status progression.
- Server and API already support the `todo`, `doing`, and `done` statuses through the existing wish PATCH.
- App moves a `todo` wish to `doing` with a “开始计划” action, then supports completion from the doing view.
- Web currently offers “标记完成” regardless of whether the status is `todo`, `doing`, or already `done`; it has no `todo` → `doing` action.

## Objective

Expose the existing Web wish status lifecycle in a clear forward order without changing the server contract or status model.

## Scope

- For `todo`, show “开始计划” and PATCH status `doing` after user action.
- For `doing`, retain the existing completion confirmation and PATCH status `done`.
- For `done`, do not show a redundant completion action.
- Reuse the current update mutation and surface failures for the immediate start-plan action.
- Keep existing detail/list query refresh behavior and update PRD/harness evidence.

## Non-goals

- No new status, rollback/reopen transition, API, schema, OpenAPI, or App behavior change.
- No change to who can transition status; preserve existing server relationship authorization.
- No new Web test framework or dependency.
- No live browser/server/account access.

## Material decisions

- `todo → doing → done` is already represented by the server enum and App UI, so Web can match it without inventing product semantics.
- Moving to `doing` is a direct PATCH and needs no confirmation; completion remains explicitly confirmed through the existing dialog.
- Completed wishes remain viewable and editable according to existing behavior, but this phase adds no reverse status transition.

## Acceptance criteria

- `todo` wishes offer only “开始计划” as the forward status action and save `doing` through the existing PATCH.
- `doing` wishes offer the existing confirmed “标记完成” flow and save `done`.
- `done` wishes do not offer “标记完成” again.
- Failed `todo → doing` updates are visible and do not report success.
- Successful status changes refresh the current detail and wish list via the existing query mutation.
- Web lint/build and `git diff --check` pass; no API/schema behavior changed.

## Verification plan

- Run `pnpm --dir web lint`, `pnpm --dir web build`, and `git diff --check`.
- Static-review status-to-label mapping, PATCH values, completion dialog routing, disabled states, error feedback, and query invalidation.
- Do not claim a live browser/API integration test.

## Risks and limitations

- No Web unit test runner or live server/browser environment is configured; status behavior is verified through type/build checks and code review.
- The phase does not define or implement restoring a completed wish to an active status.

## Results

- A `todo` wish now uses the existing update mutation to move to `doing` from “开始计划”; failed updates remain visible.
- A `doing` wish uses the existing explicit completion dialog to move to `done`.
- A `done` wish has no repeated completion action. Completion deep links for `todo`/`done` are closed instead of bypassing the forward flow.
- List/detail/record cache refresh remains the existing mutation behavior; no server/API/schema change.

## Verification results

- Passed `pnpm --dir web lint`, `pnpm --dir web build`, and `git diff --check`.
- Static review confirmed status-specific actions and labels, `doing`/`done` PATCH payloads, failure copy, and cache invalidation.
- No live browser/API integration; Web build retains existing Zod/Rollup and large-chunk warnings.

## Handoff

Continue the PRD R1/P0 audit, leaving unresolved product choices and external integration limitations visible.
