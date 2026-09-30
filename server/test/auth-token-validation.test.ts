import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { describe, it } from "node:test";
import { HttpError } from "../src/errors.js";
import {
  getAuthenticatedUserIdFromPayload,
  parseBearerToken,
  verifyAuthToken,
} from "../src/auth/token.js";

const TEST_SECRET = "synthetic-auth-validation-test-secret";

function assertUnauthorized(action: () => unknown) {
  assert.throws(action, (error: unknown) =>
    error instanceof HttpError &&
    error.statusCode === 401 &&
    error.message === "invalid or expired token"
  );
}

describe("Bearer token parsing", () => {
  it("extracts a token from a Bearer authorization header", () => {
    assert.equal(parseBearerToken("Bearer signed-token"), "signed-token");
  });

  it("rejects missing, empty, or non-Bearer headers", () => {
    assertUnauthorized(() => parseBearerToken(undefined));
    assertUnauthorized(() => parseBearerToken(""));
    assertUnauthorized(() => parseBearerToken("Bearer "));
    assertUnauthorized(() => parseBearerToken("Basic signed-token"));
  });
});

describe("JWT authentication validation", () => {
  it("accepts a valid token with a non-empty string subject", () => {
    const token = jwt.sign({ sub: "42", username: "alice" }, TEST_SECRET);
    const payload = verifyAuthToken(token, TEST_SECRET);

    assert.equal(payload.sub, "42");
    assert.equal(payload.username, "alice");
    assert.equal(typeof payload.iat, "number");
  });

  it("rejects empty, wrongly signed, expired, and malformed-subject tokens", () => {
    const wrongSignature = jwt.sign({ sub: "42" }, "another-synthetic-secret");
    const expired = jwt.sign({ sub: "42" }, TEST_SECRET, { expiresIn: -1 });
    const missingSubject = jwt.sign({ username: "alice" }, TEST_SECRET);
    const blankSubject = jwt.sign({ sub: "  " }, TEST_SECRET);

    assertUnauthorized(() => verifyAuthToken("", TEST_SECRET));
    assertUnauthorized(() => verifyAuthToken(wrongSignature, TEST_SECRET));
    assertUnauthorized(() => verifyAuthToken(expired, TEST_SECRET));
    assertUnauthorized(() => verifyAuthToken(missingSubject, TEST_SECRET));
    assertUnauthorized(() => verifyAuthToken(blankSubject, TEST_SECRET));
  });
});

describe("authenticated user ID extraction", () => {
  it("converts a positive integer subject to the user ID", () => {
    assert.equal(getAuthenticatedUserIdFromPayload({ sub: "42" }), 42);
  });

  it("rejects zero, negative, fractional, and non-numeric subjects", () => {
    for (const sub of ["0", "-2", "4.5", "not-a-number"]) {
      assertUnauthorized(() => getAuthenticatedUserIdFromPayload({ sub }));
    }
  });
});
