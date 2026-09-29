# Phase 29 context — Wish private cover update/clear

Phase 28 made Wish covers private by storing `cover_object_key` and signing URLs only after existing Wish read authorization. The current `updateWishSchema` is `.strict()` and its PATCH handler conditionally assigns submitted fields while retaining relationship authorization in the UPDATE statement.

The Web detail page edits scalar fields through update mutations. The App detail page links to a full Wish edit form. Both can reuse the existing authenticated upload endpoint (`/upload/media?folder=album`) and submit the returned key. The App already has `CoverPicker`; the Web detail cover can expose a native image-file chooser.

PATCH uses omitted (unchanged), string (replace), and `null` (clear). To prevent a legacy URL from shadowing a new key, replacement clears `cover`; clear nulls both columns. Public URLs are not accepted as new cover updates. Schema validates object-key shape; the handler checks uploader ownership after authorized Wish lookup and before the existing authorized conditional write.

Do not delete old objects after replacement or clear: there is no safe reference counting/lifecycle contract yet. Do not compensate upload failures in this phase. UI keeps useful error feedback, and failed save does not imply success. After successful App save, existing detail focus refresh obtains a new short-lived signed URL. Server/API/UI changes pass lint/build/type checks; no real database, R2, browser, or device integration was run.
