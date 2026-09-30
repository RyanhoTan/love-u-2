import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getAnniversaryCalendar, getCalendarDateText, getUpcomingAnniversaries,
  isSupportedTimeZone, millisecondsUntilNextCalendarDay, previewRemainingDays,
  startCalendarRefresh,
  sharedCalendarsMatch,
} from "../../web/src/lib/couple-calendar.js";
import {
  getAnniversaryCalendar as serverCalendar, getCalendarDateText as serverDate,
  isSupportedTimeZone as serverZone,
} from "../src/couple/calendar.js";
import { formatSharedTodayDate } from "../../web/src/lib/date.js";
import { anniversaryQueryKey } from "../../web/src/features/anniversary/query-scope.js";

describe("Web shared-date anniversary preview", () => {
  it("uses the server reference day rather than browser-local today", (context) => {
    context.mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-09-29T16:30:00Z") });
    const values = { date: "2026.09.30", repeatType: "none" as const };
    assert.equal(previewRemainingDays(values, "2026-09-29"), 1);
    assert.equal(previewRemainingDays(values, "2026-09-30"), 0);
  });

  it("does not fabricate a countdown without valid calendar metadata/input", () => {
    assert.equal(previewRemainingDays({ date: "2026.09.30", repeatType: "none" }, null), null);
    assert.equal(previewRemainingDays({ date: "2026.02.29", repeatType: "yearly" }, "2026-09-30"), null);
  });

  it("matches server leap-day, future first annual, once-only, year-end and DST fixtures", () => {
    for (const [original, repeat, today] of [
      ["2024-02-29", "yearly", "2025-02-27"],
      ["2024-02-29", "yearly", "2028-02-28"],
      ["2028-09-30", "yearly", "2026-09-30"],
      ["2026-03-09", "none", "2026-03-08"],
      ["2026-11-02", "none", "2026-11-01"],
      ["2020-01-01", "yearly", "2026-12-31"],
      ["2026-09-29", "none", "2026-09-30"],
    ] as const) {
      assert.deepEqual(getAnniversaryCalendar(original, repeat, today), serverCalendar(original, repeat, today));
      assert.equal(previewRemainingDays({ date: original.replaceAll("-", "."), repeatType: repeat }, today), serverCalendar(original, repeat, today).remainingDays);
    }
  });

  it("formats the shared calendar date without reinterpreting midnight in the device zone", () => {
    assert.equal(formatSharedTodayDate("2026-10-01"), "10月1日 星期四");
    assert.equal(formatSharedTodayDate("2026-02-29"), "共同日期待更新");
    assert.equal(formatSharedTodayDate(null), "共同日期待更新");
  });

  it("matches server named-zone validation and selected-zone dates", () => {
    for (const zone of ["UTC", "Asia/Shanghai", "America/New_York", "Europe/London", "+08:00", "Asia/Invalid", ""]) {
      assert.equal(isSupportedTimeZone(zone), serverZone(zone));
      if (isSupportedTimeZone(zone)) {
        for (const instant of ["2026-09-29T16:30:00Z", "2026-03-09T03:30:00Z", "2026-11-02T04:30:00Z"]) {
          assert.equal(getCalendarDateText(zone, new Date(instant)), serverDate(zone, new Date(instant)));
        }
      }
    }
  });

  it("selects actual next occurrence dates, excludes past records and preserves the source list", () => {
    const items = [
      { id: 3, nextOccurrenceDate: "2026-10-01" },
      { id: 1, nextOccurrenceDate: "2026-09-29" },
      { id: 4, nextOccurrenceDate: "2026-09-30" },
      { id: 2, nextOccurrenceDate: "2026-09-30" },
    ];
    assert.deepEqual(getUpcomingAnniversaries(items, "2026-09-30").map((item) => item.id), [2, 4, 3]);
    assert.equal(items[0].id, 3);
    assert.deepEqual(getUpcomingAnniversaries(items, null), []);
  });

  it("schedules the selected midnight, including 23-hour and 25-hour DST days", () => {
    assert.equal(millisecondsUntilNextCalendarDay("Asia/Shanghai", new Date("2026-09-29T15:30:00Z")), 30 * 60_000 + 25);
    assert.equal(millisecondsUntilNextCalendarDay("America/New_York", new Date("2026-03-08T05:00:00Z")), 23 * 3_600_000 + 25);
    assert.equal(millisecondsUntilNextCalendarDay("America/New_York", new Date("2026-11-01T04:00:00Z")), 25 * 3_600_000 + 25);
  });

  it("refreshes on rollover/resume, waits while hidden and cancels disposed callbacks", () => {
    let now = new Date("2026-09-29T15:30:00Z");
    let visible = true;
    let refreshes = 0;
    let nextId = 0;
    const timers = new Map<number, () => void>();
    const controller = startCalendarRefresh({
      timeZone: "Asia/Shanghai", referenceDate: "2026-09-29",
      now: () => now, isVisible: () => visible, refresh: () => { refreshes += 1; },
      schedule: (callback) => { timers.set(++nextId, callback); return nextId; },
      cancel: (timer) => { timers.delete(timer); },
    });
    assert.equal(refreshes, 0);
    const first = timers.get(1)!;
    timers.delete(1);
    now = new Date("2026-09-29T16:00:00.025Z");
    first();
    assert.equal(refreshes, 1);
    visible = false;
    controller.resume();
    assert.equal(refreshes, 1);
    visible = true;
    controller.resume();
    assert.equal(refreshes, 2);
    assert.equal(timers.size, 1);
    const pending = timers.get(nextId)!;
    controller.dispose();
    pending();
    controller.resume();
    assert.equal(refreshes, 2);
    assert.equal(timers.size, 0);
  });

  it("requests a fresh response for a cached prior-day reference without inventing a new count", () => {
    let refreshes = 0;
    let cancelled = false;
    const controller = startCalendarRefresh({
      timeZone: "Asia/Shanghai", referenceDate: "2026-09-29",
      now: () => new Date("2026-09-29T16:30:00Z"),
      isVisible: () => true, refresh: () => { refreshes += 1; },
      schedule: () => 1, cancel: () => { cancelled = true; },
    });
    assert.equal(refreshes, 1);
    controller.dispose();
    assert.equal(cancelled, true);
  });

  it("isolates cached anniversary results across accounts and changed partners without putting tokens in keys", () => {
    assert.deepEqual(anniversaryQueryKey(1, 2), ["anniversaries", 1, 2]);
    assert.notDeepEqual(anniversaryQueryKey(1, 2), anniversaryQueryKey(2, 1));
    assert.notDeepEqual(anniversaryQueryKey(1, 2), anniversaryQueryKey(1, 3));
    assert.notDeepEqual(anniversaryQueryKey(1, 2), anniversaryQueryKey(1, null));
    assert.deepEqual(anniversaryQueryKey(null, null), ["anniversaries", null, null]);
  });

  it("does not combine a homepage count with a different timezone/day anniversary response", () => {
    const current = { timeZone: "Asia/Shanghai", todayDate: "2026-09-30" };
    assert.equal(sharedCalendarsMatch(current, current), true);
    assert.equal(sharedCalendarsMatch({ ...current, todayDate: "2026-09-29" }, current), false);
    assert.equal(sharedCalendarsMatch({ ...current, timeZone: "UTC" }, current), false);
    assert.equal(sharedCalendarsMatch(undefined, current), false);
    assert.equal(sharedCalendarsMatch({ timeZone: null, todayDate: null }, current), false);
  });
});
