# Phase 55 — Make App wish record creation failure-safe

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001 requires process records to belong to the selected shared wish.
- `app/app/home/wish-list/[id]/records/create.tsx` only shows a toast when `getWishById` fails, clears `loadingWish`, and leaves an editable form with a fallback title/description and active Save action.
- Phase 51 established the App pattern for loading, retryable error, and stale request suppression in a wish detail flow.

## Objective

Require a successfully loaded target wish before users can compose or submit a process record.

## Scope

- Add visible loading, error, retry, and ready states for the existing `getWishById` request.
- Gate the entire form, media picker, and save action until the target wish is confirmed.
- Provide a back action for an invalid route ID and a retry action for a valid ID whose request failed.
- Ignore stale wish responses after retry or route change.
- Preserve existing record drafts, media uploads, and `createWishRecord` behavior after the wish successfully loads.

## Non-goals

- No server/API/database/authorization/media policy changes or record payload changes.
- No changes to draft persistence, process-record editing, or the completion flow.
- No new dependencies, test framework, device, API, credentials, database, or R2 access.

## Material decisions

- A toast is insufficient because it disappears while the form remains actionable with an unknown target.
- A valid route ID does not prove the user has loaded the wish or still has permission to read it; the existing POST remains server-authorized and is not changed.
- A retry must reload only the wish summary; local record draft restoration remains keyed to the route ID and is shown only after successful target confirmation.
- Use a request sequence and effect cleanup to prevent an old wish response from repainting after retry/navigation.

## Acceptance criteria

- Initial load shows a visible loading state and no wish fallback card or editable form.
- Failed target read shows an accessible error with retry; the form, media picker, and save action are absent.
- Invalid IDs provide a way back and never show an editable form.
- Successful retry displays the server-returned wish and existing record form/draft; saving still uses the same API and payload.
- Stale requests cannot update state after a newer retry or route change.
- App lint, TypeScript check, and `git diff --check` pass; upload and create API semantics remain unchanged.

## Verification plan

- Run `pnpm --dir app lint` and `pnpm --dir app exec tsc --noEmit`.
- Statically inspect loading/error/ready gating, retry, invalid ID, save guard, draft restore, and stale-request cleanup.
- Do not access a device, API, database, credentials, or R2.

## Results

- The editor now distinguishes loading, error, and ready states for the target wish.
- Initial loading and read failure no longer render the fallback wish card, editable form, media picker, or save action.
- A valid ID can retry the same wish GET; an invalid ID offers back navigation.
- Request IDs and effect cleanup ignore a stale response after retry or route change.
- Successful wish loading still restores the existing route-keyed draft and uses the same media upload and record-create payload.

## Handoff

Continue the PRD R1/P0 audit; preserve remaining device/live-service limitations.
