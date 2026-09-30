# Phase 61 context — concurrent duplicate registration

The users table has a unique index on `username`, while registration first runs a `SELECT`
and then inserts. Two requests can both see no row; MySQL rejects one insert with
`ER_DUP_ENTRY`. Since the global handler maps `HttpError` to its status but unknown errors
to a generic 500, the losing request previously surfaced as an internal error.

The route now catches only the user insert. `ER_DUP_ENTRY` maps to the established 409
`username already exists` response; every other insert error is rethrown. A focused pure
classifier test covers duplicate, unrelated, and malformed errors. The current users table
has only the username unique key, so treating duplicate-key errors from this specific insert
as username conflicts is aligned with the present schema.

No schema/API/client changes or live MySQL integration were included. A database-backed
concurrency test remains useful when a safe local integration fixture exists.
