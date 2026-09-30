# Phase 60 — Preserve full password bytes in bcrypt auth

## Status

`Complete`

## Source inputs

- `PRD-AUTH-001`: registration/login, invalid-session recovery, protected resources, and secure password storage.
- `server/src/router_handler/user.ts`: registration stores a direct bcrypt hash; login compares the raw submitted password.
- Upstream `bcrypt` documentation states that only the first 72 UTF-8 bytes are used; this is bytes, not characters: [node.bcrypt.js security notes](https://github.com/kelektiv/node.bcrypt.js#security-issues-and-concerns).
- Local reproduction against the installed package: a candidate with the same first 72 bytes and a different suffix matched the stored hash.

## Objective

Ensure newly registered passwords are not silently made equivalent when they differ only after bcrypt's 72-byte boundary, while preserving the login behavior of existing hashes.

## In scope

- Add a password hashing helper that SHA-256 pre-hashes the exact UTF-8 password, then applies bcrypt; prefix stored hashes with an explicit version marker.
- Use the versioned format for all new registrations.
- Verify versioned hashes against the full input bytes.
- Continue verifying legacy direct-bcrypt hashes. After a valid legacy login with fewer than 72 UTF-8 bytes, opportunistically upgrade the hash using a conditional `UPDATE ... WHERE id = ? AND password_hash = ?` so concurrent state cannot be overwritten.
- Do not auto-upgrade a legacy login input of 72 or more bytes: the old hash cannot reveal the originally submitted suffix, and rehashing a possibly truncated candidate could change which historical password is accepted.
- Add dependency-free Node tests for full-input distinction, invalid password, legacy compatibility, and migration boundaries.

## Explicit non-goals

- No database schema/column change, API request-shape change, token/session change, client UI change, password reset flow, or user-data inspection.
- No forced password reset or behavior change for legacy credentials at/above 72 UTF-8 bytes.
- No claim that the historical bcrypt truncation risk is eliminated for legacy long-password accounts; those remain compatible and require a future recovery/migration decision.
- No production DB, credentials, live account, push, or deployment access.

## Acceptance criteria

- Two newly hashed inputs sharing 72 leading bytes but differing afterward do not authenticate as each other.
- New hashes remain within the existing `password_hash VARCHAR(255)` column and are recognizable by version prefix.
- Valid legacy passwords still verify; wrong legacy passwords fail.
- A valid legacy password shorter than 72 UTF-8 bytes requests a conditional rehash; 72+ byte legacy input preserves the legacy hash and login semantics.
- Login only issues a token after successful verification; the rehash uses the existing row ID and prior hash as compare-and-set conditions.
- Server tests, lint, build, and `git diff --check` pass.

## Verification plan and limitations

- Add Node built-in tests around pure hash/verify helpers, including multibyte UTF-8 boundary behavior.
- Run `pnpm --dir server test`, `pnpm --dir server lint`, `pnpm --dir server build`, and `git diff --check`.
- Static-review registration/login integration, conditional update arguments, token issuance order, and absence of password/hash logging.
- No DB integration test is available in this scoped phase; document it rather than implying login migration was exercised against MySQL.

## Handoff

New registrations now use the versioned full-input format, and eligible legacy hashes are upgraded after successful login. The legacy ≥72-byte compatibility limit and lack of DB integration evidence are recorded in `harness/context/phase-60-password-hash-compatibility-context.md` and `harness/build-log.md`.
