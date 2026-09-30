import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { describe, it } from "node:test";
import { buildCoupleProfileUpdate } from "../src/couple/profile-update.js";
import { updateCoupleProfileSchema } from "../src/schema/couple.js";

function withFixture(run: (database: DatabaseSync) => void) {
  const database = new DatabaseSync(":memory:");
  try {
    database.exec(`
      CREATE TABLE couple_relationships (
        id INTEGER PRIMARY KEY, user_a_id INTEGER, user_b_id INTEGER, status TEXT,
        anniversary_date TEXT, time_zone TEXT DEFAULT 'Asia/Shanghai', updated_at TEXT
      );
      INSERT INTO couple_relationships (id, user_a_id, user_b_id, status, anniversary_date)
        VALUES (10, 1, 2, 'bound', '2024-02-29'), (20, 3, 4, 'bound', '2025-01-01');
    `);
    run(database);
  } finally {
    database.close();
  }
}

describe("shared couple profile updates", () => {
  it("accepts partial date/timezone updates and rejects empty, invalid calendar or zone values", () => {
    for (const payload of [
      { anniversaryDate: null },
      { anniversaryDate: "2024-02-29" },
      { timeZone: "Asia/Shanghai" },
      { anniversaryDate: "2026-09-30", timeZone: "America/New_York" },
    ]) {
      assert.equal(updateCoupleProfileSchema.safeParse(payload).success, true);
    }
    for (const payload of [
      {}, { unrelated: true }, { timeZone: "" }, { timeZone: "+08:00" },
      { timeZone: "Asia/Invalid" }, { anniversaryDate: "2026-02-29" },
      { anniversaryDate: "0999-12-31" }, { timeZone: null },
    ]) {
      assert.equal(updateCoupleProfileSchema.safeParse(payload).success, false);
    }
  });

  it("preserves omitted dates/timezones and allows either current partner to update", () => {
    withFixture((database) => {
      const timezoneUpdate = buildCoupleProfileUpdate(10, 1, { timeZone: "Europe/London" });
      assert.equal(database.prepare(timezoneUpdate.sql).run(...timezoneUpdate.values).changes, 1);
      const row = database.prepare("SELECT anniversary_date, time_zone FROM couple_relationships WHERE id = 10").get();
      assert.equal(row?.anniversary_date, "2024-02-29");
      assert.equal(row?.time_zone, "Europe/London");
      const dateUpdate = buildCoupleProfileUpdate(10, 2, { anniversaryDate: null });
      assert.equal(database.prepare(dateUpdate.sql).run(...dateUpdate.values).changes, 1);
      const updated = database.prepare("SELECT anniversary_date, time_zone FROM couple_relationships WHERE id = 10").get();
      assert.equal(updated?.anniversary_date, null);
      assert.equal(updated?.time_zone, "Europe/London");
    });
  });

  it("does not update another relation or follow the user into a new binding after lookup", () => {
    withFixture((database) => {
      const outsiderUpdate = buildCoupleProfileUpdate(20, 1, { timeZone: "UTC" });
      assert.equal(database.prepare(outsiderUpdate.sql).run(...outsiderUpdate.values).changes, 0);
      const beforeRevocation = buildCoupleProfileUpdate(10, 1, { timeZone: "UTC" });
      database.exec(`
        UPDATE couple_relationships SET status = 'unbound' WHERE id = 10;
        INSERT INTO couple_relationships (id, user_a_id, user_b_id, status)
          VALUES (30, 1, 5, 'bound');
      `);
      assert.equal(database.prepare(beforeRevocation.sql).run(...beforeRevocation.values).changes, 0);
      for (const row of database.prepare("SELECT time_zone FROM couple_relationships").all()) {
        assert.equal(row.time_zone, "Asia/Shanghai");
      }
    });
  });

  it("updates both fields together while keeping date-only input unchanged", () => {
    withFixture((database) => {
      const payload = updateCoupleProfileSchema.parse({
        anniversaryDate: "2026-09-30",
        timeZone: " America/New_York ",
      });
      const update = buildCoupleProfileUpdate(10, 2, payload);
      assert.equal(database.prepare(update.sql).run(...update.values).changes, 1);
      const row = database.prepare(
        "SELECT anniversary_date, time_zone FROM couple_relationships WHERE id = 10",
      ).get();
      assert.equal(row?.anniversary_date, "2026-09-30");
      assert.equal(row?.time_zone, "America/New_York");
    });
  });
});
