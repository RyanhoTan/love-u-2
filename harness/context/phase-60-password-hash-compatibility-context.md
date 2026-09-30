# Phase 60 context — Password hash compatibility

## Confirmed behavior

- Upstream bcrypt documentation says only the first 72 UTF-8 bytes are used; local execution of the installed dependency confirmed two strings with the same first 72 bytes compare as the same password under a legacy hash.
- New registration hashes a fixed domain-separation prefix plus the exact UTF-8 password with SHA-256, then bcrypts the digest and stores it with the explicit `insync-bcrypt-sha256-v1:` format prefix. The bcrypt digest plus prefix fits the existing `password_hash VARCHAR(255)` column.
- Login recognizes the new prefix and verifies the full-input digest. Unprefixed rows continue through direct bcrypt verification for backward compatibility.
- After a successful legacy verification whose submitted password is strictly shorter than 72 UTF-8 bytes, the server generates a new-format hash and conditionally updates only the same user row whose binary old hash still matches. The update is awaited before issuing the login token.
- Inputs of 72 bytes or longer are not upgraded because an old bcrypt hash cannot prove whether the original input had a suffix beyond byte 72. This preserves the existing accepted-login behavior rather than guessing which submitted string to make canonical.

## Remaining risk and migration boundary

Legacy hashes whose intended passwords were 72 or more UTF-8 bytes remain subject to bcrypt's old prefix-equivalence behavior until a safe password reset/change flow is defined. The current PRD has no account recovery flow; this phase does not invent one or force a reset. New registrations and successfully logged-in legacy passwords below the boundary use exact full-input hashing.

## Verification limits

- Node built-in tests verify new full-input distinction, wrong-password rejection, shorter legacy compatibility/upgrade eligibility, Unicode byte counting, and 72+ byte legacy compatibility.
- Registration/login helper behavior passed server tests, lint, and TypeScript build. The SQL conditional migration path was statically reviewed; no MySQL account/session integration was run.
- No passwords, credentials, tokens, existing account rows, production data, or live services were accessed. Test passwords are synthetic.

## Source references

- `server/src/auth/password.ts`
- `server/src/router_handler/user.ts`
- `server/test/auth-password.test.ts`
- `server/src/db/schema.ts` (`password_hash VARCHAR(255)`)
- [node.bcrypt.js security notes](https://github.com/kelektiv/node.bcrypt.js#security-issues-and-concerns)
