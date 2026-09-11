import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";

const WAVE_HEIGHTS = [6, 12, 18, 10, 16, 8, 14, 18, 9, 13, 7, 15, 11, 17, 8];

const MIN_BUBBLE_WIDTH_PX = 120;
const MAX_BUBBLE_WIDTH_PX = 220;
const MIN_DURATION_SECONDS = 1;
const MAX_DURATION_SECONDS = 60;
const MIN_WAVE_BARS = 4;

type VoiceBubbleProps = {
  src: string;
  incoming: boolean;
  durationSeconds?: number;
};

function formatDuration(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function durationProgress(durationSeconds: number) {
  const clamped = Math.min(
    MAX_DURATION_SECONDS,
    Math.max(MIN_DURATION_SECONDS, durationSeconds),
  );

  return (
    (clamped - MIN_DURATION_SECONDS) /
    (MAX_DURATION_SECONDS - MIN_DURATION_SECONDS)
  );
}

function bubbleWidthPx(durationSeconds: number) {
  const progress = durationProgress(durationSeconds);
  return Math.round(
    MIN_BUBBLE_WIDTH_PX + progress * (MAX_BUBBLE_WIDTH_PX - MIN_BUBBLE_WIDTH_PX),
  );
}

function waveBarCount(durationSeconds: number) {
  const progress = durationProgress(durationSeconds);
  return Math.round(
    MIN_WAVE_BARS + progress * (WAVE_HEIGHTS.length - MIN_WAVE_BARS),
  );
}

function readAudioDuration(audio: HTMLAudioElement) {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    return audio.duration;
  }

  return null;
}

export function VoiceBubble({
  src,
  incoming,
  durationSeconds,
}: VoiceBubbleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [measuredDuration, setMeasuredDuration] = useState<number | null>(null);

  const duration =
    durationSeconds != null &&
    Number.isFinite(durationSeconds) &&
    durationSeconds > 0
      ? durationSeconds
      : measuredDuration;
  const resolvedDuration = duration ?? MIN_DURATION_SECONDS;
  const width = bubbleWidthPx(resolvedDuration);
  const bars = WAVE_HEIGHTS.slice(0, waveBarCount(resolvedDuration));

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = "metadata";
    audioRef.current = audio;
    setMeasuredDuration(null);
    setPlaying(false);

    function applyDuration(next: number | null) {
      if (next != null) {
        setMeasuredDuration(next);
      }
    }

    function onLoadedMetadata() {
      const known = readAudioDuration(audio);
      if (known != null) {
        applyDuration(known);
        return;
      }

      // Some recorded formats (e.g. webm) report Infinity until seeked.
      audio.currentTime = Number.MAX_SAFE_INTEGER;
    }

    function onDurationChange() {
      applyDuration(readAudioDuration(audio));
    }

    function onTimeUpdate() {
      const known = readAudioDuration(audio);
      if (known == null) {
        return;
      }

      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.currentTime = 0;
      applyDuration(known);
    }

    function onEnded() {
      setPlaying(false);
    }

    function onPause() {
      setPlaying(false);
    }

    function onPlay() {
      setPlaying(true);
    }

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
      audioRef.current = null;
    };
  }, [src]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (playing) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
    } catch {
      setPlaying(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={playing ? "暂停语音" : "播放语音"}
      className={cx(
        "flex h-11 items-center gap-2.5 px-3.5",
        incoming
          ? "rounded-[18px] rounded-bl-md bg-bubble"
          : "rounded-[18px] rounded-br-md bg-accent",
      )}
      style={{ width }}
      onClick={() => {
        void togglePlayback();
      }}
    >
      {playing ? (
        <Pause
          className={cx(
            "size-4 shrink-0",
            incoming ? "text-fg" : "text-inverse",
          )}
          strokeWidth={2}
          fill="currentColor"
        />
      ) : (
        <Play
          className={cx(
            "size-4 shrink-0",
            incoming ? "text-fg" : "text-inverse",
          )}
          strokeWidth={2}
          fill="currentColor"
        />
      )}

      <span
        className="flex h-[18px] min-w-0 flex-1 items-center justify-between gap-[3px]"
        aria-hidden="true"
      >
        {bars.map((height, index) => (
          <span
            key={index}
            className={cx(
              "w-[3px] shrink-0 rounded-sm",
              incoming ? "bg-fg-secondary/60" : "bg-inverse/80",
              playing &&
                "motion-safe:animate-[recording-wave_0.9s_ease-in-out_infinite] motion-reduce:animate-none",
            )}
            style={{
              height,
              animationDelay: `${index * 60}ms`,
            }}
          />
        ))}
      </span>

      <span
        className={cx(
          "shrink-0 text-xs font-medium tabular-nums",
          incoming ? "text-fg-secondary" : "text-inverse",
        )}
      >
        {duration == null ? "…" : formatDuration(duration)}
      </span>
    </button>
  );
}
