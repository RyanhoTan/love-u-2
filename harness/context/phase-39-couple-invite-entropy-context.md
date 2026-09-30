# Phase 39 context — Strengthen couple invite code entropy

## Observed baseline

- Before this phase, server-generated couple invite codes were six characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (32 symbols) using `Math.random()`.
- `couple_invites.code` is a primary key in `VARCHAR(12)`.
- `bindCoupleSchema` trims and accepts 6–12 uppercase alphanumeric characters. The Web normalizer uppercases and removes punctuation; App submits the entered string.
- The invite lookup/bind transaction, one-use status update, and 30-minute expiry are unchanged by this phase.
- No rate-limit middleware or binding-attempt limiter was found in the server source during the scoped search.

## Decisions

- Newly generated codes are 12 characters drawn one symbol at a time with `node:crypto` `randomInt`; existing valid six-character invite records remain bindable.
- The alphabet remains unchanged to avoid visually ambiguous characters.
- A Node built-in test file exercises the pure generator via an injected deterministic random-index function; production defaults to cryptographic randomness.
- `server/package.json` now exposes `pnpm --dir server test` through Node's built-in test runner and the already-installed `tsx` loader; no dependency was added.

## Unresolved / deferred

- No rate limiting currently constrains authenticated invite-guess attempts. Larger entropy is defense in depth, not a replacement for throttling/abuse controls.
- Schema and request compatibility were inspected statically; no production-like DB, old active invite row, or live client bind path was available for integration testing.
- The concurrent code check/insert race still relies on the database primary key and is not covered without MySQL.
