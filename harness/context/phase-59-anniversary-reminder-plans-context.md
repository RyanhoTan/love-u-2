# Phase 59 context — Anniversary reminder plan inputs

## Confirmed contract

`server/src/schema/anniversary.ts` accepts one integer `reminderDaysBefore` from 0 through 30. Zero is the same-day plan; there is no unset/null state. This phase keeps that API and storage contract unchanged.

## Implemented behavior

- App create has a single selected plan, defaults to 7 days, and offers same day, 3 days, or 7 days. Its request payload sends the selected scalar directly.
- App edit continues to show the stored scalar and includes a non-preset value in the action sheet, so retaining an existing 0–30 value does not require normalizing it to a preset.
- Web create/edit uses the scalar as its form state, validates the server's 0–30 integer range, and maps the server value directly in both directions. The common choices are 0/3/7; an existing non-preset value is shown as a keep-current option in edit.
- Web preview now renders exactly one reminder-plan label. Both clients continue to state that plans are stored only and notifications are not sent.

## Important non-claims

- The common choices for creating a new record are discrete (0/3/7); this phase does not add arbitrary-day entry UI even though the API accepts up to 30.
- No reminder is scheduled or delivered. Notification preference, scheduling, permissions, and delivery remain outside this phase.
- No real browser, App device, service, database, or stored account was used. App/Web have no configured UI test runner; validation was lint/typecheck/build plus source review.
- Server “today” and browser preview can still use different local timezones near date boundaries. No canonical user/couple timezone policy is declared in the PRD/schema, so this phase intentionally does not guess one; see the unresolved PRD-DAY-001 timezone acceptance item.

## Source references

- `server/src/schema/anniversary.ts`
- `app/app/home/anniversary/create.tsx`
- `app/app/home/anniversary/[id]/edit.tsx`
- `web/src/pages/days-page/types.ts`
- `web/src/pages/days-page/form-fields.tsx`
- `web/src/pages/days-page/preview.tsx`
- `harness/build/phase-20-honest-anniversary-reminder-copy.md`
- `harness/build/phase-22-mobile-anniversary-editing-and-deletion.md`
