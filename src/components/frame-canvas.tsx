import { type Frame, useStudio } from "@/lib/studio-store";

export function FrameCanvas({
  frame,
  slotMap,
  onSlotClick,
  selectedSlot,
  size = "lg",
  instanceKey,
}: {
  frame: Frame;
  slotMap: (string | null)[];
  onSlotClick?: (idx: number) => void;
  selectedSlot?: number | null;
  size?: "sm" | "lg";
  instanceKey?: string;
}) {
  const maxW = size === "sm" ? 240 : 900;
  const hasImage = !!frame.image;
  const rotations = useStudio((s) => s.rotations);
  const slotTransforms = useStudio((s) => s.slotTransforms);
  const photos = useStudio((s) => s.sessionPhotos);
  const key = instanceKey ?? frame.id;
  return (
    <div
      className="relative w-full mx-auto"
      style={{
        maxWidth: maxW,
        aspectRatio: "3 / 4",
        background: hasImage ? undefined : (frame.bg ?? "#FAF7F2"),
        border: hasImage ? undefined : `8px solid ${frame.border ?? "#E7E1D8"}`,
        borderRadius: hasImage ? undefined : 6,
        boxShadow: hasImage ? undefined : "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {frame.slotRects.map((r, i) => {
        const photoId = slotMap?.[i];
        const photo = photos.find((p) => p.id === photoId);
        const isSelected = selectedSlot === i;
        const rot = rotations[`${key}:${i}`] ?? 0;
        const tr = slotTransforms[`${key}:${i}`] ?? { scale: 1, x: 0, y: 0 };
        const slotContent = photo ? (
          <img
            src={photo.url}
            alt=""
            className="w-full h-full object-cover"
            style={{
              transform: `translate(${tr.x}%, ${tr.y}%) scale(${tr.scale}) rotate(${rot}deg)`,
              transformOrigin: "center",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
            {i + 1}
          </div>
        );
        const slotClassName = `absolute overflow-hidden transition-all ${
          onSlotClick ? "cursor-pointer" : "cursor-default"
        } ${isSelected ? "ring-4 ring-primary z-20" : "z-10"}`;
        const slotStyle = {
          left: `${r.x}%`,
          top: `${r.y}%`,
          width: `${r.w}%`,
          height: `${r.h}%`,
          backgroundColor: photo ? "transparent" : "rgba(0,0,0,0.06)",
        };

        return onSlotClick ? (
          <button
            key={i}
            type="button"
            aria-label={`Slot ${i + 1}`}
            onClick={() => onSlotClick(i)}
            className={slotClassName}
            style={slotStyle}
          >
            {slotContent}
          </button>
        ) : (
          <div key={i} aria-label={`Slot ${i + 1}`} className={slotClassName} style={slotStyle}>
            {slotContent}
          </div>
        );
      })}
      {hasImage && (
        <img
          src={frame.image}
          alt={frame.name}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30"
        />
      )}
      {!hasImage && frame.accent && (
        <div
          className="absolute bottom-2 left-0 right-0 text-center text-[10px] tracking-[0.3em] uppercase pointer-events-none z-30"
          style={{ color: frame.accent }}
        >
          {frame.name}
        </div>
      )}
    </div>
  );
}
