# Phase 42 context — Serialize concurrent couple bindings

## Observed baseline

- `bindCoupleSpace` starts a transaction, checks the invitee's active relationship, reads a pending invite, checks the inviter's active relationship, inserts a bound relationship, then marks the invite used.
- The checks are ordinary reads and no lock is taken on either participant account, so requests with different invite codes can race on a shared user.
- `couple_invites.code` is already a primary key; `users.id` is already a primary key. No schema addition is needed to lock these records.
- The unbind endpoint updates the active relationship but does not create relationships; this phase does not change its history semantics.

## Decisions

- Use a locking read for the selected invite row, then acquire both account-row locks one at a time in ascending user ID order.
- Perform active relationship checks only after account locks have been acquired. Revalidate invite expiry and conditionally consume the pending code before commit.
- Keep all changes scoped to the existing server bind transaction and a pure lock-order helper/test.

## Implemented behavior

- The invite is selected with `FOR UPDATE`; participant account rows are individually selected with `FOR UPDATE` through the ascending/deduplicated lock helper.
- Active relationship checks also use current locking reads after account locks, so the bind transaction does not rely on an earlier unbound snapshot.
- The final invite update predicates on code, inviter, pending status, and database expiry time. A zero-row update throws before commit and the transaction catch rolls back the relationship insert.
- Server unit tests, lint, and build pass. The deterministic test covers helper ordering only, not MySQL locking semantics.

## Unresolved / deferred

- No configured MySQL instance is available, so same-code and shared-account races cannot be executed against InnoDB.
- Production transaction isolation, deadlock rates, lock-wait timeout behavior, and any out-of-band relationship writers remain unverified.
- Invite attempt throttling is still absent; it is a separate abuse-control issue and is not solved by row locks or code entropy.
