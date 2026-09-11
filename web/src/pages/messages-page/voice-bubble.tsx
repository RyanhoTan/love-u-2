import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";

const WAVE_HEIGHTS = [6, 12, 18, 10, 16, 8, 14, 18, 9, 13, 7, 15, 11, 17, 8];

type VoiceBubbleProps = {
  src: string;
  incoming: boolean;
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

export function VoiceBubble({ src, incoming }: VoiceBubbleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = "metadata";
    audioRef.current = audio;

    function onLoadedMetadata() {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
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
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
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
        "flex h-11 w-fit items-center gap-2.5 px-3.5",
        incoming
          ? "rounded-[18px] rounded-bl-md bg-bubble"
          : "rounded-[18px] rounded-br-md bg-accent",
      )}
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
        className="flex h-[18px] shrink-0 items-center gap-[3px]"
        aria-hidden="true"
      >
        {WAVE_HEIGHTS.map((height, index) => (
          <span
            key={index}
            className={cx(
              "w-[3px] rounded-sm",
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
        {playing ? "播放中…" : formatDuration(duration ?? 0)}
      </span>
    </button>
  );
}
