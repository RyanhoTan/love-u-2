import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  generateInviteCode,
  INVITE_CODE_ALPHABET,
  INVITE_CODE_LENGTH,
} from "../src/couple/invite-code.js";

describe("generateInviteCode", () => {
  it("generates a 12-character code from the human-friendly alphabet", () => {
    const code = generateInviteCode();

    assert.equal(code.length, INVITE_CODE_LENGTH);
    assert.match(code, /^[A-HJ-NP-Z2-9]{12}$/);
    assert.equal(/[I0O1]/.test(code), false);
  });

  it("uses one bounded random draw per character", () => {
    const requestedBounds: number[] = [];
    const indexes = Array.from({ length: INVITE_CODE_LENGTH }, (_, index) => index);
    const code = generateInviteCode((maxExclusive) => {
      requestedBounds.push(maxExclusive);
      return indexes[requestedBounds.length - 1];
    });

    assert.equal(code, INVITE_CODE_ALPHABET.slice(0, INVITE_CODE_LENGTH));
    assert.deepEqual(
      requestedBounds,
      Array.from({ length: INVITE_CODE_LENGTH }, () => INVITE_CODE_ALPHABET.length)
    );
  });
});
