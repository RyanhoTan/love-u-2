# Phase 45 context — media upload policy

## Observed baseline

- Web/App album and wish uploads use folder `album`; App/Web chat voice uploads use `interact`.
- The server accepted any folder and Content-Type and copied the client filename extension into the object key.
- Express already capped raw `/upload` bodies at 100 MiB, but the body-parser overflow path was reported as a generic 500.
- Wish video thumbnail generation calls the shared upload helper with `album` and `image/jpeg`.

## Decisions

- Folder policy is `album` for images/videos and `interact` for audio.
- MIME parameters are stripped for lookup and storage. The extension comes from the explicit MIME allowlist, not the filename.
- The existing 100 MiB limit is preserved and shared between Express parsing and helper checks.
- `x-file-name` is ignored by the server; existing clients may continue sending it without relying on it.
- MIME values are client declarations only. No byte-signature check was added.
- Upload keys remain `${folder}/${authenticatedUserId}/...`; the public upload response remains `{ key }` without a URL.

## Implemented behavior

- Unsupported folder and empty/invalid length produce safe 400 errors.
- Unsupported MIME or folder/category combinations produce 415.
- Declared payload size above 100 MiB produces 413, including raw parser overflow.
- A small dependency-free media policy module tests folder/type matrix, parameter normalization, safe extension mapping, and size edges.
- OpenAPI source and generated Web types document the policy.

## Unresolved / deferred

- Header/container signature matching was added in Phase 58; full codec/container parsing remains deferred.
- Exercise raw Express parser responses and successful/interrupted uploads against an isolated object-store test double or environment.
- Define cleanup/compensation for objects uploaded without corresponding database records and for deletions.
