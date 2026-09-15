import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type WheelEvent,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Heart,
  Share2,
  X,
} from "lucide-react";

const MIN_IMAGE_SCALE = 0.5;
const MAX_IMAGE_SCALE = 3;
const RUBBER_BAND_CONSTANT = 0.55;

type ImageOffset = {
  x: number;
  y: number;
};

type ImageDrag = ImageOffset & {
  pointerId: number;
  startX: number;
  startY: number;
};

type PanBounds = {
  maxX: number;
  maxY: number;
  rubberBandX: number;
  rubberBandY: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function rubberBand(overshoot: number, dimension: number) {
  if (dimension === 0) {
    return 0;
  }

  return (
    (overshoot * dimension * RUBBER_BAND_CONSTANT) /
    (dimension + RUBBER_BAND_CONSTANT * Math.abs(overshoot))
  );
}

function rubberBandPosition(value: number, limit: number, dimension: number) {
  const boundedValue = clamp(value, -limit, limit);
  const overshoot = value - boundedValue;

  return boundedValue + rubberBand(overshoot, dimension);
}

function clampImageOffset(offset: ImageOffset, bounds: PanBounds) {
  return {
    x: clamp(offset.x, -bounds.maxX, bounds.maxX),
    y: clamp(offset.y, -bounds.maxY, bounds.maxY),
  };
}

export type MediaViewerItem = {
  id: number | string;
  src: string;
  thumbnailSrc?: string;
  kind: "image" | "video";
  label?: string;
  alt?: string;
};

type MediaViewerProps = {
  items: readonly MediaViewerItem[];
  initialIndex: number;
  onClose: () => void;
  onFavorite?: (item: MediaViewerItem) => void;
  onShare?: (item: MediaViewerItem) => void;
  onMore?: (item: MediaViewerItem) => void;
};

export function MediaViewer({
  items,
  initialIndex,
  onClose,
  onFavorite,
  onShare,
  onMore,
}: MediaViewerProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState<ImageOffset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const imageDragRef = useRef<ImageDrag | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const activeItem = items[activeIndex];

  const measurePanBounds = useCallback((scale: number): PanBounds => {
    const viewport = viewportRef.current;
    const image = imageRef.current;

    if (!viewport || !image) {
      return { maxX: 0, maxY: 0, rubberBandX: 0, rubberBandY: 0 };
    }

    const imageWidth = image.offsetWidth * scale;
    const imageHeight = image.offsetHeight * scale;

    return {
      maxX: Math.max(0, (imageWidth - viewport.clientWidth) / 2),
      maxY: Math.max(0, (imageHeight - viewport.clientHeight) / 2),
      rubberBandX: Math.min(viewport.clientWidth / 2, imageWidth / 2),
      rubberBandY: Math.min(viewport.clientHeight / 2, imageHeight / 2),
    };
  }, []);

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setImageScale(1);
    setImageOffset({ x: 0, y: 0 });
    setIsDragging(false);
    imageDragRef.current = null;
  }, [activeItem?.id]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || typeof ResizeObserver === "undefined") {
      return;
    }

    function keepImageInBounds() {
      const bounds = measurePanBounds(imageScale);
      setImageOffset((currentOffset) =>
        clampImageOffset(currentOffset, bounds),
      );
    }

    const resizeObserver = new ResizeObserver(keepImageInBounds);
    resizeObserver.observe(viewport);

    if (imageRef.current) {
      resizeObserver.observe(imageRef.current);
    }

    keepImageInBounds();

    return () => resizeObserver.disconnect();
  }, [activeItem?.id, imageScale, measurePanBounds]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.target instanceof HTMLVideoElement) {
        return;
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((index) => Math.max(0, index - 1));
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((index) => Math.min(items.length - 1, index + 1));
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [items.length, onClose]);

  if (!activeItem) {
    return null;
  }

  function selectItem(index: number) {
    setActiveIndex(index);
  }

  function handleImageWheel(event: WheelEvent<HTMLDivElement>) {
    if (activeItem.kind !== "image") {
      return;
    }

    event.preventDefault();
    setImageScale((scale) =>
      Math.min(
        MAX_IMAGE_SCALE,
        Math.max(MIN_IMAGE_SCALE, scale - event.deltaY * 0.001),
      ),
    );
  }

  function handleImagePointerDown(event: PointerEvent<HTMLImageElement>) {
    const bounds = measurePanBounds(imageScale);

    if (bounds.maxX === 0 && bounds.maxY === 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    imageDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: imageOffset.x,
      y: imageOffset.y,
    };
  }

  function handleImagePointerMove(event: PointerEvent<HTMLImageElement>) {
    const imageDrag = imageDragRef.current;

    if (!imageDrag || imageDrag.pointerId !== event.pointerId) {
      return;
    }

    const bounds = measurePanBounds(imageScale);

    setImageOffset({
      x: rubberBandPosition(
        imageDrag.x + event.clientX - imageDrag.startX,
        bounds.maxX,
        bounds.rubberBandX,
      ),
      y: rubberBandPosition(
        imageDrag.y + event.clientY - imageDrag.startY,
        bounds.maxY,
        bounds.rubberBandY,
      ),
    });
  }

  function handleImagePointerUp(event: PointerEvent<HTMLImageElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const bounds = measurePanBounds(imageScale);
    setIsDragging(false);
    setImageOffset((currentOffset) => clampImageOffset(currentOffset, bounds));
    imageDragRef.current = null;
  }

  function handleImageLoad() {
    const bounds = measurePanBounds(imageScale);
    setImageOffset((currentOffset) => clampImageOffset(currentOffset, bounds));
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-[#1c1418] text-white"
      role="dialog"
      aria-modal="true"
      aria-label={`预览${activeItem.label || "媒体"}`}
      onClick={handleBackdropClick}
    >
      <header className="flex h-14 shrink-0 items-center justify-between bg-[#1c1418cc] px-5 backdrop-blur-[24px]">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            aria-label="关闭预览"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <X className="size-[18px]" strokeWidth={2} />
          </button>
          <span className="truncate text-sm text-white">
            {activeItem.label || "媒体预览"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="收藏媒体"
            onClick={() => onFavorite?.(activeItem)}
            className="grid size-8 place-items-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <Heart className="size-[18px]" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="分享媒体"
            onClick={() => onShare?.(activeItem)}
            className="grid size-8 place-items-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <Share2 className="size-[18px]" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="更多媒体操作"
            onClick={() => onMore?.(activeItem)}
            className="grid size-8 place-items-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <Ellipsis className="size-[18px]" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-6"
        onWheel={handleImageWheel}
        onClick={handleBackdropClick}
      >
        {items.length > 1 ? (
          <button
            type="button"
            aria-label="上一个媒体"
            disabled={activeIndex === 0}
            onClick={() => selectItem(activeIndex - 1)}
            className="absolute left-4 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white transition-colors hover:bg-black/60 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <ChevronLeft className="size-5" strokeWidth={1.8} />
          </button>
        ) : null}

        <div
          className="flex h-full min-h-0 w-full max-w-[980px] items-center justify-center overflow-hidden rounded-lg"
          ref={viewportRef}
          onClick={handleBackdropClick}
        >
          {activeItem.kind === "video" ? (
            <video
              key={activeItem.id}
              src={activeItem.src}
              poster={activeItem.thumbnailSrc}
              aria-label={activeItem.alt || activeItem.label || "视频"}
              className="max-h-full max-w-full object-contain"
              controls
              autoPlay
              playsInline
              onClick={(event) => event.stopPropagation()}
            />
          ) : (
            <img
              ref={imageRef}
              key={activeItem.id}
              src={activeItem.src}
              alt={activeItem.alt || activeItem.label || "照片"}
              draggable={false}
              onLoad={handleImageLoad}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={handleImagePointerDown}
              onPointerMove={handleImagePointerMove}
              onPointerUp={handleImagePointerUp}
              onPointerCancel={handleImagePointerUp}
              className={`max-h-full max-w-full select-none object-contain ${
                imageScale > MIN_IMAGE_SCALE
                  ? "cursor-grab touch-none active:cursor-grabbing"
                  : ""
              } ${
                isDragging
                  ? "transition-none"
                  : "transition-transform duration-200 ease-[cubic-bezier(0.2,0.9,0.2,1)] motion-reduce:transition-none"
              }`}
              style={{
                transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${imageScale})`,
              }}
            />
          )}
        </div>

        {items.length > 1 ? (
          <button
            type="button"
            aria-label="下一个媒体"
            disabled={activeIndex === items.length - 1}
            onClick={() => selectItem(activeIndex + 1)}
            className="absolute right-4 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white transition-colors hover:bg-black/60 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <ChevronRight className="size-5" strokeWidth={1.8} />
          </button>
        ) : null}
      </div>

      <div className="flex h-[88px] shrink-0 items-center overflow-x-auto bg-[#1c1418cc] px-6 py-3 backdrop-blur-[24px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex shrink-0 gap-2">
          {items.map((item, index) => {
            const thumbnail = item.thumbnailSrc || item.src;
            const selected = index === activeIndex;

            return (
              <button
                key={item.id}
                type="button"
                aria-label={`查看${item.label || `第${index + 1}个媒体`}`}
                aria-current={selected ? "true" : undefined}
                onClick={() => selectItem(index)}
                className={`relative size-16 shrink-0 overflow-hidden rounded-md bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 ${
                  selected
                    ? "ring-2 ring-white ring-offset-2 ring-offset-[#1c1418]"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                {item.kind === "video" ? (
                  <video
                    src={item.src}
                    poster={item.thumbnailSrc}
                    aria-hidden="true"
                    className="size-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={thumbnail}
                    alt=""
                    className="size-full object-cover"
                  />
                )}
                {item.kind === "video" ? (
                  <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/20">
                    <span className="grid size-7 place-items-center rounded-full bg-black/55">
                      <span className="ml-0.5 block size-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-white" />
                    </span>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
