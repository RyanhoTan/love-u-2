import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isMySqlDuplicateEntryError } from "../src/auth/registration.js";

describe("registration database errors", () => {
  it("recognizes MySQL duplicate-entry errors", () => {
    assert.equal(isMySqlDuplicateEntryError({ code: "ER_DUP_ENTRY" }), true);
  });

  it("does not classify unrelated or malformed errors as duplicates", () => {
    assert.equal(isMySqlDuplicateEntryError({ code: "ECONNREFUSED" }), false);
    assert.equal(isMySqlDuplicateEntryError({ message: "duplicate" }), false);
    assert.equal(isMySqlDuplicateEntryError(null), false);
    assert.equal(isMySqlDuplicateEntryError("ER_DUP_ENTRY"), false);
  });
});
