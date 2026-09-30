import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { acquireCoupleBindingLocks } from "../src/couple/bind-locks.js";

describe("couple binding account locks", () => {
  it("acquires unique account locks sequentially in ascending order", async () => {
    const events: string[] = [];

    await acquireCoupleBindingLocks([9, 2, 9, 5], async (userId) => {
      events.push(`start:${userId}`);
      await Promise.resolve();
      events.push(`end:${userId}`);
    });

    assert.deepEqual(events, [
      "start:2",
      "end:2",
      "start:5",
      "end:5",
      "start:9",
      "end:9",
    ]);
  });
});
