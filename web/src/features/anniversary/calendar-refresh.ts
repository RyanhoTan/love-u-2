import { useEffect, useRef } from "react";
import { isSupportedTimeZone, startCalendarRefresh } from "@/lib/couple-calendar";

export function useCalendarRefresh(
  timeZone: string | null | undefined,
  referenceDate: string | null | undefined,
  refresh: (isCurrent: () => boolean) => void | Promise<unknown>,
  refreshOnStart = false,
) {
  const latestRefresh = useRef(refresh);
  useEffect(() => {
    latestRefresh.current = refresh;
  }, [refresh]);
  useEffect(() => {
    let active = true;
    let pending = false;
    const refreshNow = () => {
      if (!active || pending || document.visibilityState !== "visible") return;
      pending = true;
      void Promise.resolve()
        .then(() => {
          if (active) return latestRefresh.current(() => active);
        })
        .catch(() => undefined)
        .finally(() => { pending = false; });
    };
    const controller = timeZone && isSupportedTimeZone(timeZone) ? startCalendarRefresh({
      timeZone,
      referenceDate,
      now: () => new Date(),
      schedule: (callback, delay) => window.setTimeout(callback, delay),
      cancel: (timer) => window.clearTimeout(timer),
      isVisible: () => document.visibilityState === "visible",
      refresh: refreshNow,
    }) : null;
    const resume = () => {
      if (controller) controller.resume();
      else refreshNow();
    };
    if (refreshOnStart) refreshNow();
    window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      active = false;
      controller?.dispose();
      window.removeEventListener("focus", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [timeZone, referenceDate, refreshOnStart]);
}
