# Phase 64 context — server auth validation

Server REST authorization and WebSocket handshake both depend on `server/src/auth.ts`. Its
module imports config (which loads `.env`) and therefore is not safe to import from isolated
unit tests in this workflow. Phase 64 extracts pure helpers that receive the JWT secret as an
argument; the production wrapper remains responsible for supplying `config.jwtSecret`.

Synthetic-key tests can then cover Bearer parsing, signature and expiry rejection, `sub` shape,
and conversion to a positive integer user ID without reading environment files or touching
MySQL. This is stronger local evidence but not a substitute for endpoint/DB/WS integration.
