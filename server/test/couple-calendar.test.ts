import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_COUPLE_TIME_ZONE,
  differenceInCalendarDays,
  getAnniversaryCalendar,
  getCalendarDateText,
  getDaysInLove,
  isSupportedTimeZone,
} from "../src/couple/calendar.js";

describe("shared couple calendar", () => {
  it("uses one selected timezone across the UTC/Shanghai midnight boundary", () => {
    const now = new Date("2026-09-29T16:30:00.000Z");
    assert.equal(DEFAULT_COUPLE_TIME_ZONE, "Asia/Shanghai");
    assert.equal(getCalendarDateText("Asia/Shanghai", now), "2026-09-30");
    assert.equal(getCalendarDateText("UTC", now), "2026-09-29");
    assert.equal(getDaysInLove("2026-09-30", getCalendarDateText("Asia/Shanghai", now)), 1);
  });

  it("counts calendar days across New York spring/fall DST instead of elapsed hours", () => {
    assert.equal(
      getCalendarDateText("America/New_York", new Date("2026-03-09T03:30:00Z")),
      "2026-03-08",
    );
    for (const [first, last] of [
      ["2026-03-08T05:00:00Z", "2026-03-09T04:00:00Z"],
      ["2026-11-01T04:00:00Z", "2026-11-02T05:00:00Z"],
    ]) {
      assert.equal(differenceInCalendarDays(
        getCalendarDateText("America/New_York", new Date(first)),
        getCalendarDateText("America/New_York", new Date(last)),
      ), 1);
    }
  });

  it("validates named zones without accepting typos, empty values or offsets", () => {
    for (const zone of ["Asia/Shanghai", "America/New_York", "Europe/London", "UTC"]) {
      assert.equal(isSupportedTimeZone(zone), true, zone);
    }
    for (const zone of ["", "+08:00", "Beijing", "Asia/NotAZone", "Asia/Shanghai "]) {
      assert.equal(isSupportedTimeZone(zone), false, zone);
    }
  });

  it("keeps once-only, today, year-end and future first yearly dates consistent", () => {
    assert.deepEqual(getAnniversaryCalendar("2026-09-30", "none", "2026-09-30"), {
      nextOccurrenceDate: "2026-09-30", remainingDays: 0,
    });
    assert.deepEqual(getAnniversaryCalendar("2020-01-01", "yearly", "2026-12-31"), {
      nextOccurrenceDate: "2027-01-01", remainingDays: 1,
    });
    assert.deepEqual(getAnniversaryCalendar("2028-09-30", "yearly", "2026-09-30"), {
      nextOccurrenceDate: "2028-09-30", remainingDays: 731,
    });
    assert.equal(getAnniversaryCalendar("2026-09-29", "none", "2026-09-30").remainingDays, 0);
  });

  it("keeps the existing February 28 fallback and returns February 29 in leap years", () => {
    assert.deepEqual(getAnniversaryCalendar("2024-02-29", "yearly", "2025-02-27"), {
      nextOccurrenceDate: "2025-02-28", remainingDays: 1,
    });
    assert.equal(getAnniversaryCalendar("2024-02-29", "yearly", "2028-02-28").remainingDays, 1);
    assert.equal(getAnniversaryCalendar("2024-02-29", "yearly", "2025-03-01").nextOccurrenceDate, "2026-02-28");
  });

  it("keeps inclusive relationship days, null dates and future dates", () => {
    assert.equal(getDaysInLove(null, "2026-09-30"), null);
    assert.equal(getDaysInLove("2026-09-30", "2026-09-30"), 1);
    assert.equal(getDaysInLove("2026-09-29", "2026-09-30"), 2);
    assert.equal(getDaysInLove("2026-10-01", "2026-09-30"), 0);
    assert.equal(differenceInCalendarDays("2024-02-28", "2024-03-01"), 2);
  });
});
