# Phase 39 — Strengthen couple invite code entropy

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-COUPLE-001 requires expiring invitations and reliable rejection of invalid/reused codes.
- `server/src/router_handler/couple.ts` generated six-character codes with `Math.random()` from a 32-character alphabet.
- `server/src/db/schema.ts` stores invite codes in a `VARCHAR(12)` primary key; the bind schema accepts 6–12 uppercase alphanumeric characters.
- Web and App treat the code as a string and do not impose a six-character limit. The Web normalizer removes punctuation and uppercases input.
- A repository search found no server-side rate limiter for couple binding attempts. This phase improves unpredictability and search space but does not add request throttling.

## Objective

Make newly generated couple invitation codes materially harder to predict or guess without invalidating existing active invite codes or changing the binding lifecycle.

## Scope

- Generate 12-character invite codes using Node.js `crypto.randomInt` and the existing human-friendly alphabet.
- Keep invite code persistence, primary-key collision check, expiration, regeneration, and bind behavior unchanged.
- Preserve compatibility with existing 6-character codes; the request schema already accepts 6–12 characters.
- Add a built-in Node test-runner entry and deterministic tests for generated code shape and bounded random selection. Do not add dependencies or require MySQL.

## Non-goals

- No rate limiting, CAPTCHA, account-verification gate, invite endpoint redesign, or changes to error/status semantics.
- No schema migration; the existing `VARCHAR(12)` accommodates generated codes.
- No change to expiration duration, single-use state transition, or active invite reuse.
- No changes to relationship data retention or unbind policy.
- No live database, API, credential, or user-account access.

## Material decisions

- Use the maximum length already supported by the database and bind schema (12 characters). With 32 allowed characters this creates a 60-bit search space while preserving current clients' string-based handling.
- Use `crypto.randomInt(alphabet.length)` per character. Its bounded integer API avoids modulo bias and is backed by the system cryptographic random source; `Math.random()` is not suitable for bearer invitation secrets.
- Keep the alphabet unchanged, excluding visually ambiguous `I`, `O`, `0`, and `1`.
- Inject only the bounded index function into the pure generator so unit tests can deterministically verify the requested bound without mocking global randomness.
- Do not claim this replaces rate limiting. Binding abuse throttling remains a separate security gap.

## Acceptance criteria

- Every newly generated invite is exactly 12 characters from the existing alphabet.
- The production generator gets every character index from Node's cryptographic `randomInt` API, not `Math.random()`.
- Existing 6-character codes remain accepted by the unchanged 6–12 character bind schema.
- Automated server tests verify generated shape, excluded ambiguous characters, and one correctly bounded draw per character.
- Server lint/build, server test script, and `git diff --check` pass.
- No database or external service is required for the tests.

## Verification plan

- Run `pnpm --dir server test`.
- Run `pnpm --dir server lint` and `pnpm --dir server build`.
- Run `git diff --check` and inspect the focused diff for API/schema compatibility.
- Confirm tests and docs state the unaddressed rate-limit and DB integration limitations.

## Results

- New invite codes are 12 characters selected from the existing alphabet using Node.js `crypto.randomInt`; the database/schema bind range and existing invite lookup lifecycle remain unchanged.
- Added `pnpm --dir server test` using Node's built-in test runner and the existing `tsx` dependency. The deterministic test covers alphabet-bound draws; a production-default test checks output length and allowed characters.
- Updated server lint to include the new test file and corrected `AGENTS.md` so it describes the test entry accurately.

## Verification results

- Passed: `pnpm --dir server test` (2 tests).
- Passed: `pnpm --dir server lint` (source and test files).
- Passed: `pnpm --dir server build`.
- Passed: `git diff --check`.
- Static compatibility review confirmed `VARCHAR(12)`, the 6–12 character bind schema, and clients that normalize/submit strings without enforcing a 6-character limit. No MySQL/API/client integration was run.

## Risks and limitations

- There is no server-side rate limiting for binding attempts. Twelve-character codes substantially increase brute-force cost but do not prevent request flooding or abuse; a separate scoped rate-limit design is still needed.
- The database primary key remains the collision guard. Concurrent duplicate code generation/insertion was not exercised against MySQL.
- No DB-backed invitation lifecycle test or live Web/App bind flow was run.

## Handoff

Continue the PRD R1/P0 review. Revisit bind-attempt throttling and database transaction behavior as separate, independently scoped work.
