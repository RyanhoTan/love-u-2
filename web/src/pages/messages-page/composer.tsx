import {
  ArrowUp,
  ChevronRight,
  ChevronUp,
  Image,
  Keyboard,
  Mic,
  Plus,
  Trash2,
  Video,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { uploadMedia } from "@/api/upload";
import { IconButton } from "@/components/ui/button";
import { cx } from "@/lib/cx";

const CANCEL_THRESHOLD = 48;
const MIN_VOICE_MS = 500;
const WAVE_HEIGHTS = [8, 14, 18, 10, 16, 12, 18, 9, 15];

type Mode = "text" | "voice";
type VoicePhase = "idle" | "recording" | "cancel";

type MessagesComposerProps = {
  disabled?: boolean;
  onSendText: (text: string) => boolean;
  onSendAudio: (audioUrl: string) => boolean;
};

function pickRecorderMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  return (
    candidates.find((type) =>
      typeof MediaRecorder !== "undefined"
        ? MediaRecorder.isTypeSupported(type)
        : false,
    ) ?? ""
  );
}

function extensionForMimeType(mimeType: string) {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function MessagesComposer({
  disabled = false,
  onSendText,
  onSendAudio,
}: MessagesComposerProps) {
  const [mode, setMode] = useState<Mode>("text");
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [voicePhase, setVoicePhase] = useState<VoicePhase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const startY = useRef(0);
  const startedAt = useRef(0);
  const voicePhaseRef = useRef<VoicePhase>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  function setPhase(next: VoicePhase) {
    voicePhaseRef.current = next;
    setVoicePhase(next);
  }

  function handleSend() {
    if (disabled) {
      return;
    }

    const text = draft.trim();
    if (!text) {
      return;
    }

    if (onSendText(text)) {
      setDraft("");
    }
  }

  useEffect(() => {
    if (voicePhase === "idle") {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 200);

    return () => window.clearInterval(timer);
  }, [voicePhase]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      stopStream(streamRef.current);
    };
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setPhase("idle");
    setMenuOpen(false);
    setVoiceError(null);
  }

  async function startRecording() {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      throw new Error("当前浏览器不支持录音");
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    if (voicePhaseRef.current === "idle") {
      stopStream(stream);
      return;
    }

    const mimeType = pickRecorderMimeType();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    chunksRef.current = [];
    streamRef.current = stream;
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.start();
  }

  function finishRecording() {
    return new Promise<Blob | null>((resolve) => {
      const recorder = mediaRecorderRef.current;
      const stream = streamRef.current;

      if (!recorder || recorder.state === "inactive") {
        stopStream(stream);
        streamRef.current = null;
        mediaRecorderRef.current = null;
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const blob =
          chunksRef.current.length > 0
            ? new Blob(chunksRef.current, { type })
            : null;
        chunksRef.current = [];
        stopStream(stream);
        streamRef.current = null;
        mediaRecorderRef.current = null;
        resolve(blob && blob.size > 0 ? blob : null);
      };

      recorder.stop();
    });
  }

  async function onHoldPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (disabled || voiceBusy) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    startY.current = event.clientY;
    startedAt.current = Date.now();
    setElapsed(0);
    setVoiceError(null);
    setPhase("recording");

    try {
      await startRecording();
    } catch (caught) {
      setPhase("idle");
      setVoiceError(
        caught instanceof Error ? caught.message : "无法使用麦克风",
      );
    }
  }

  function onHoldPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (voicePhaseRef.current === "idle") {
      return;
    }

    const lifted = startY.current - event.clientY;
    setPhase(lifted > CANCEL_THRESHOLD ? "cancel" : "recording");
  }

  async function onHoldPointerUp() {
    if (voicePhaseRef.current === "idle") {
      return;
    }

    const cancelled = voicePhaseRef.current === "cancel";
    const durationMs = Date.now() - startedAt.current;
    setPhase("idle");

    const blob = await finishRecording();

    if (cancelled || !blob || durationMs < MIN_VOICE_MS) {
      if (!cancelled && durationMs < MIN_VOICE_MS) {
        setVoiceError("说话时间太短");
      }
      return;
    }

    if (disabled) {
      return;
    }

    setVoiceBusy(true);
    setVoiceError(null);

    try {
      const mimeType = blob.type || "audio/webm";
      const file = new File(
        [blob],
        `voice.${extensionForMimeType(mimeType)}`,
        { type: mimeType },
      );
      const uploaded = await uploadMedia(file, "interact");
      if (!onSendAudio(uploaded.url)) {
        setVoiceError("发送失败，请重试");
      }
    } catch (caught) {
      setVoiceError(caught instanceof Error ? caught.message : "语音发送失败");
    } finally {
      setVoiceBusy(false);
    }
  }

  return (
    <div className="relative shrink-0">
      {menuOpen ? (
        <AttachMenu
          onClose={closeMenu}
          onVoice={() => switchMode("voice")}
          onPhoto={() => photoRef.current?.click()}
          onVideo={() => videoRef.current?.click()}
        />
      ) : null}

      {voiceError ? (
        <p className="px-6 pb-1 text-center text-[12px] text-danger" role="alert">
          {voiceError}
        </p>
      ) : null}

      <div
        className={cx(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
          voicePhase === "recording"
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <CancelSendHint />
        </div>
      </div>

      <div className="flex h-[72px] items-center gap-2.5 bg-surface-soft/85 px-6 py-3 backdrop-blur-[20px]">
        <IconButton
          label={menuOpen ? "关闭菜单" : "更多"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="size-4" strokeWidth={2} />
          ) : (
            <Plus className="size-4" strokeWidth={2} />
          )}
        </IconButton>

        {mode === "text" ? (
          <IconButton label="语音" onClick={() => switchMode("voice")}>
            <Mic className="size-4" strokeWidth={2} />
          </IconButton>
        ) : (
          <IconButton label="键盘" onClick={() => switchMode("text")}>
            <Keyboard className="size-4" strokeWidth={2} />
          </IconButton>
        )}

        {mode === "text" ? (
          <>
            <input
              type="text"
              value={draft}
              disabled={disabled}
              placeholder={disabled ? "连接中…" : "发消息…"}
              className="h-10 min-w-0 flex-1 rounded-[20px] border border-border bg-surface px-4 text-sm text-fg outline-none placeholder:text-fg-muted disabled:opacity-60"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="button"
              aria-label="发送"
              disabled={disabled || !draft.trim()}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-[18px] bg-accent text-inverse transition-[background-color,transform] duration-100 ease-out hover:bg-accent-pressed active:scale-[0.97] motion-reduce:active:scale-100 disabled:opacity-40"
              onClick={handleSend}
            >
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <HoldToTalk
            phase={voicePhase}
            elapsed={elapsed}
            busy={voiceBusy}
            disabled={disabled || voiceBusy}
            onPointerDown={(event) => {
              void onHoldPointerDown(event);
            }}
            onPointerMove={onHoldPointerMove}
            onPointerUp={() => {
              void onHoldPointerUp();
            }}
            onPointerCancel={() => {
              void onHoldPointerUp();
            }}
          />
        )}
      </div>

      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={() => closeMenu()}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={() => closeMenu()}
      />
    </div>
  );
}

function CancelSendHint() {
  return (
    <div className="flex justify-center bg-surface-soft/85 px-6 pt-2 pb-1 backdrop-blur-[16px]">
      <p className="inline-flex h-9 items-center gap-2 rounded-[18px] bg-accent-soft px-3.5 text-[13px] font-semibold text-accent">
        <ChevronUp className="size-4" strokeWidth={2} />
        上滑取消发送
      </p>
    </div>
  );
}

function HoldToTalk({
  phase,
  elapsed,
  busy,
  disabled,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  phase: VoicePhase;
  elapsed: number;
  busy: boolean;
  disabled: boolean;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
}) {
  const cancelling = phase === "cancel";

  return (
    <button
      type="button"
      disabled={disabled && phase === "idle"}
      className={cx(
        "flex h-12 min-w-0 flex-1 items-center rounded-[24px] px-4 text-sm select-none touch-none",
        phase === "idle"
          ? "justify-center gap-2 bg-accent-soft text-fg disabled:opacity-60"
          : cancelling
            ? "justify-between gap-3 bg-[#F8E6E6] text-danger"
            : "justify-between gap-3 border border-accent bg-surface text-fg",
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {busy && phase === "idle" ? (
        <span className="font-semibold">发送中…</span>
      ) : phase === "idle" ? (
        <>
          <Mic className="size-4" strokeWidth={2} />
          按住说话
        </>
      ) : (
        <>
          <span className="flex items-center gap-2.5">
            {cancelling ? (
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-danger/15">
                <Trash2 className="size-3.5" strokeWidth={2} />
              </span>
            ) : (
              <span className="size-2.5 rounded-full bg-accent" />
            )}
            <span className="font-semibold">
              {cancelling ? "松开取消" : "正在录音"}
            </span>
          </span>
          <Waveform active={!cancelling} danger={cancelling} />
          <span className="flex flex-col items-end text-[11px] leading-tight">
            <span className="tabular-nums">{formatElapsed(elapsed)}</span>
            <span>{cancelling ? "松手丢弃" : "松开发送"}</span>
          </span>
        </>
      )}
    </button>
  );
}

function Waveform({ active, danger }: { active: boolean; danger: boolean }) {
  return (
    <span className="flex h-[18px] items-center gap-[3px]" aria-hidden="true">
      {WAVE_HEIGHTS.map((height, index) => (
        <span
          key={index}
          className={cx(
            "w-[3px] origin-center rounded-full",
            danger ? "bg-danger" : "bg-accent",
            active &&
              "motion-safe:animate-[recording-wave_0.9s_ease-in-out_infinite] motion-reduce:animate-none",
          )}
          style={{
            height,
            animationDelay: `${index * 80}ms`,
          }}
        />
      ))}
    </span>
  );
}

function AttachMenu({
  onClose,
  onVoice,
  onPhoto,
  onVideo,
}: {
  onClose: () => void;
  onVoice: () => void;
  onPhoto: () => void;
  onVideo: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="关闭菜单"
        className="absolute inset-x-0 bottom-full z-10 h-[calc(100vh-72px)] bg-[#1C141899]"
        onClick={onClose}
      />
      <div className="absolute bottom-[88px] left-6 z-20 flex w-80 flex-col gap-3 rounded-[20px] bg-surface p-5 shadow-[0_8px_24px_rgb(0_0_0_/_0.08)]">
        <p className="text-base font-semibold text-fg">更多</p>
        <MenuRow icon={<Mic className="size-[18px]" strokeWidth={2} />} label="语音" onClick={onVoice} />
        <MenuRow icon={<Image className="size-[18px]" strokeWidth={2} />} label="照片" onClick={onPhoto} />
        <MenuRow icon={<Video className="size-[18px]" strokeWidth={2} />} label="视频" onClick={onVideo} />
      </div>
    </>
  );
}

function MenuRow({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-11 w-full items-center gap-3 rounded-control px-3.5 text-[15px] font-medium text-fg"
      onClick={onClick}
    >
      <span className="text-fg-secondary">{icon}</span>
      <span className="min-w-0 flex-1 text-left">{label}</span>
      <ChevronRight className="size-4 text-fg-muted" strokeWidth={2} />
    </button>
  );
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
