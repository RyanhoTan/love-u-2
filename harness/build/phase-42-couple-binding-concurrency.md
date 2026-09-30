# Phase 42 — Serialize concurrent couple bindings

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-COUPLE-001 rejects simultaneous conflicting relationships.
- `server/src/router_handler/couple.ts` checks active relationships and invite status inside a transaction but does not lock either participant account.
- Two requests using different valid invites can involve the same inviter or invitee and both read “unbound” before either relationship insert commits.
- Phase 39 increased invite entropy but explicitly left database concurrency unverified.

## Objective

Serialize competing bind transactions that share either participant, so a user cannot be added to two active relationships by concurrent requests.

## Scope

- Lock the selected invite row using its primary key and a current/locking read.
- Lock both participant rows from `users` one at a time in ascending user-ID order before checking active relationships.
- After acquiring account locks, consume the invite only if it remains pending and unexpired according to database time.
- Preserve the existing relationship checks, single-use invite behavior, response codes where possible, and transaction rollback behavior.
- Add a database-independent unit test for deterministic, sequential, deduplicated account-lock order.
- Update PRD/plan/context/build evidence without claiming real database concurrency has been exercised.

## Non-goals

- No schema migration, unique-index conversion, lock table, or new dependency.
- No changes to unbind history/media/chat retention or whether a previously unbound user may form a later relationship.
- No invite rate limiter, CAPTCHA, invite expiry change, or client flow change.
- No MySQL instance, credentials, production data, or external system access.

## Material decisions

- `SELECT ... FOR UPDATE` on the invite primary key prevents two consumers from both treating the same code as pending.
- Account locks serialize different invite codes that share an inviter or invitee; acquiring rows individually in globally ascending ID order avoids inconsistent lock-order cycles between competing pairs.
- Existing relationship reads occur only after account locks are acquired. All bind writes use this endpoint, so competing binds for either account queue behind the same user row.
- The invite's final conditional update checks pending status and database time after account locks are acquired. It remains inside the same transaction as the relationship insert, so a failed consume rolls back the relationship.
- Unit tests can verify the ordering helper, but only a MySQL integration test can establish the actual InnoDB behavior and race outcome.

## Acceptance criteria

- A bind locks the current invite row and both existing account rows before checking whether either user is already bound.
- Account locks are awaited sequentially, stable, and deduplicated; all callers acquire them in the same ascending user-ID order.
- A request cannot commit a new relationship if the invite became expired or ceased to be pending while waiting for account locks; the final consume predicate uses `CURRENT_TIMESTAMP(3)`.
- On any rejected or failed bind, the transaction rolls back and does not consume an invite or leave a partial relationship.
- Existing 6–12 character invite compatibility and normal response payloads remain unchanged.
- Server tests, lint, build, and `git diff --check` pass.
- Documentation distinguishes static/unit evidence from unavailable real MySQL concurrency validation.

## Verification plan

- Add a deterministic test that holds each async lock callback until it completes and asserts ascending, sequential calls with duplicates removed.
- Run `pnpm --dir server test`, `pnpm --dir server lint`, and `pnpm --dir server build`.
- Review the bind transaction's lock order, current invite reread, expiry check, conditional consume, and rollback path.
- Run `git diff --check` and inspect the full scoped diff.
- Do not claim race-free production behavior without a MySQL-backed concurrency test.

## Risks and limitations

- Actual row-lock and isolation semantics depend on MySQL/InnoDB and the deployed schema/transaction isolation; no database is configured for this task.
- Other code paths or direct database writers that insert bound relationships without taking these account locks would not participate in this serialization contract.
- Deadlock/lock-wait behavior under production load is not measured. Database deadlock errors continue through existing request error handling and transaction rollback.

## Results

- The bind flow now reads/locks the invitation by primary key, then locks each participant account row sequentially in ascending numeric ID order.
- Both active-relationship checks are locking reads. The invite is consumed only by a conditional update for the same inviter while still pending and unexpired according to database time.
- A failed conditional consume throws before commit, so the existing catch path rolls back the preceding relationship insert.
- No API, schema, Web, or App contract changed.

## Verification results

- Passed `pnpm --dir server test` (6 tests), including the new stable sequential lock helper test.
- Passed `pnpm --dir server lint`, `pnpm --dir server build`, and `git diff --check`.
- The test first failed because the lock helper did not exist, then passed after implementation.
- Static review confirmed lock order, current reads, conditional invite consumption, and rollback flow. No real MySQL transaction or concurrent request was run.

## Handoff

Continue the PRD R1/P0 audit. Keep real MySQL-backed race verification visible as an unresolved integration requirement; this phase does not claim the database concurrency acceptance has been end-to-end verified.
