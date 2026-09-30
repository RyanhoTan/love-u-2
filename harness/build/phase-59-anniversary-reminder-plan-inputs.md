# Phase 59 — Unify anniversary reminder plan inputs

## Status

`Complete`

## Source inputs

- `PRD-DAY-001`: users can configure reminder lead time; without notification delivery, the UI must not say notifications are active.
- Phase 20: reminder delivery is not implemented; changing the input semantics was explicitly deferred.
- Server schema: `reminderDaysBefore` is one integer in the inclusive range 0–30.
- Active PRD R1/P0 Goal authorizes continuing with independently verifiable product fixes, one small commit at a time.

## Objective

Make the App and Web forms represent the persisted scalar reminder plan as exactly one selected value and prevent Web edits from silently normalizing existing values.

## In scope

- App create: replace three independent switches and priority mapping with one single-select plan, retaining the current default of 7 days.
- App edit: make existing non-preset values (0–30) explicitly selectable/preservable in addition to the common 0/3/7 presets.
- Web create/edit: replace two booleans with a validated integer `reminderDaysBefore`; preset choices are 0, 3, and 7 days.
- Web edit: include an existing non-preset value as a keep-current option so an untouched edit preserves the exact server value.
- Keep copy explicit that only a plan is saved and no notification is sent.

## Explicit non-goals

- No notification delivery, scheduler, device token, or account-level preference changes.
- No API, schema, database, OpenAPI, migration, or persisted-value changes.
- No “no reminder plan” state: the existing API has no such representation, and zero means same-day plan.
- No timezone, leap-day, or anniversary occurrence calculation changes.
- No new test framework or dependency.

## Acceptance criteria

- App and Web creation allow one and only one reminder-plan value and submit the selected scalar.
- App and Web edit show one plan, and any existing server value in 0–30 can be retained without normalization.
- Web preview displays one truthful plan label and does not combine multiple incompatible plans.
- Both clients continue to state that notification delivery is not live.
- App lint/typecheck and Web lint/build pass; diff and static mapping review pass.

## Verification plan and limitations

- Inspect scalar schema and every create/edit mapping before and after the change.
- Run `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, `pnpm --dir web lint`, `pnpm --dir web build`, and `git diff --check`.
- There is no configured App/Web UI test runner. No live API, database, account, device, or notification service will be accessed.

## Handoff

App and Web now submit one selected scalar reminder value. Web edits preserve any existing valid value, including non-preset values. Actual command results and static-review limitations are recorded in `harness/build-log.md`; design and remaining constraints are recorded in `harness/context/phase-59-anniversary-reminder-plans-context.md`.
