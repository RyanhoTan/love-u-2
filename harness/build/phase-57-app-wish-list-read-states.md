# Phase 57 — Make App wish-list reads failure-safe

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001 makes the shared wish list a P0 capability.
- `app/app/home/wish-list/index.tsx` currently catches a failed `getWishes` with only a toast and retains the prior `wishes` array.
- Because the retained cards stay rendered after a failed focus refresh, they can still be selected and passed to the existing bulk-delete flow without a current successful list read.
- The category scenes have no successful-empty feedback, so successful emptiness is also indistinguishable from a blank list.

## Objective

Show a trustworthy wish-list state and prevent stale cards from being selected or deleted after a failed refresh.

## Scope

- Add visible loading, retryable error, and successful states around the existing `getWishes` read.
- Clear stale rows/selections while refreshing; show category-specific empty feedback only after success.
- Gate wish tabs and bulk-delete actions on a successful current read.
- Ignore stale results after retry or screen blur/unmount.
- Preserve existing create/detail navigation, category filters, selection interaction, and delete API/confirmation semantics.

## Non-goals

- No server/API/database/authorization changes, bulk-delete transaction changes, or wish status/field changes.
- No changes to the recycle bin, creation form, map data contract, or wish detail pages.
- No new dependencies, test framework, device, API, credentials, database, or R2 access.

## Material decisions

- A toast alone is insufficient because it disappears while stale cards remain actionable.
- Keep header navigation available during read failures, but hide stale category content and prevent destructive selection/deletion until a read succeeds.
- Successful empty categories receive concise feedback; the message does not imply a data mutation or introduce a new product policy.
- Use request IDs and focus cleanup to prevent prior requests from repainting after retries or navigation.

## Acceptance criteria

- Initial focus shows visible loading feedback; no category cards or bulk-selection affordance is available before success.
- A failed read shows an accessible error with retry, hides stale cards and category content, and disables access to map data based on an unconfirmed list.
- A successful empty category displays an explicit empty message; a category with data displays only the server-returned rows.
- Retry/focus changes suppress stale responses; failed refresh leaves no stale selected IDs or enabled delete action.
- Existing create/recycle navigation and confirmed bulk-delete API flow remain unchanged after a successful read.
- App lint, TypeScript check, and `git diff --check` pass.

## Verification plan

- Run `pnpm --dir app lint` and `pnpm --dir app exec tsc --noEmit`.
- Statically inspect loading/error/ready gating, category empty state, retry, selection/delete guard, stale request suppression, and unchanged DELETE API calls.
- Do not access a device, API, database, credentials, or R2.

## Results

- The main wish list now shows visible loading, retryable accessible error, and successful-data states.
- A new load clears old rows and selections; category scenes and map access are unavailable until the current read succeeds.
- Each empty category now gives explicit feedback only when the wish-list request has succeeded.
- Request IDs plus focus cleanup suppress stale responses after retry/navigation; a delete confirmation opened against an older list cannot proceed after a newer request starts.
- Bulk-delete remains backed by the same `deleteWish` API and confirmation copy; create/recycle/detail navigation and category filtering remain unchanged.
- Passed `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- Static review covered loading/error/ready gating, empty categories, retry, selection and delete guards, stale request handling, and unchanged delete calls. No device or live service was exercised.

## Handoff

Continue the active PRD R1/P0 audit while keeping live integration limitations visible.
