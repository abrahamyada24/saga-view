import { useRef, useState } from "react";
import type { Frame } from "@/lib/studio-store";
import { RotateCw, Move } from "lucide-react";
import {
  applySlotInteraction,
  applySlotRotation,
  type SlotPointerPoint,
  type SlotRect,
} from "@/lib/slot-geometry";

export type { SlotRect } from "@/lib/slot-geometry";

type Mode =
  | { type: "idle" }
  | { type: "move"; idx: number; start: SlotPointerPoint; orig: SlotRect }
  | {
      type: "resize";
      idx: number;
      corner: "nw" | "ne" | "sw" | "se";
      orig: SlotRect;
    }
  | {
      type: "rotate";
      idx: number;
      center: SlotPointerPoint;
      startAngle: number;
      origRot: number;
      orig: SlotRect;
    };

export function SlotEditorCanvas({
  frame,
  rects,
  activeIdx,
  onChange,
  onSelect,
}: {
  frame: Frame;
  rects: SlotRect[];
  activeIdx: number;
  onChange: (rects: SlotRect[]) => void;
  onSelect: (idx: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>({ type: "idle" });
  const modeRef = useRef<Mode>({ type: "idle" });
  const rectsRef = useRef(rects);
  rectsRef.current = rects;

  const pctFromEvent = (e: PointerEvent | React.PointerEvent) => {
    const el = containerRef.current!;
    const b = el.getBoundingClientRect();
    return {
      x: ((e.clientX - b.left) / b.width) * 100,
      y: ((e.clientY - b.top) / b.height) * 100,
    };
  };

  const onPointerMove = (e: PointerEvent) => {
    const activeMode = modeRef.current;
    if (activeMode.type === "idle") return;
    const p = pctFromEvent(e);
    const next = [...rectsRef.current];
    if (activeMode.type === "move") {
      next[activeMode.idx] = applySlotInteraction({
        type: "move",
        start: activeMode.start,
        current: p,
        orig: activeMode.orig,
      });
    } else if (activeMode.type === "resize") {
      next[activeMode.idx] = applySlotInteraction({
        type: "resize",
        corner: activeMode.corner,
        current: p,
        orig: activeMode.orig,
        minSize: 1,
      });
    } else if (activeMode.type === "rotate") {
      next[activeMode.idx] = applySlotRotation(
        activeMode.orig,
        activeMode.center,
        p,
        activeMode.startAngle,
        activeMode.origRot,
        1,
      );
    }
    onChange(next);
  };

  const endDrag = () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endDrag);
    modeRef.current = { type: "idle" };
    setMode({ type: "idle" });
  };

  const startDrag = (m: Mode) => {
    modeRef.current = m;
    setMode(m);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full mx-auto select-none touch-none"
      style={{
        aspectRatio: "3 / 4",
        background: frame.image ? undefined : (frame.bg ?? "#FAF7F2"),
        border: frame.image ? undefined : `8px solid ${frame.border ?? "#E7E1D8"}`,
        borderRadius: frame.image ? undefined : 6,
        backgroundImage:
          "repeating-linear-gradient(45deg,rgba(0,0,0,0.04) 0 6px,transparent 6px 12px)",
      }}
    >
      {frame.image && (
        <img
          src={frame.image}
          alt={frame.name}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
        />
      )}
      {rects.map((r, i) => {
        const active = i === activeIdx;
        return (
          <div
            key={i}
            data-testid={`slot-${i}`}
            onPointerDown={(e) => {
              e.preventDefault();
              onSelect(i);
              e.currentTarget.setPointerCapture(e.pointerId);
              const p = pctFromEvent(e);
              startDrag({
                type: "move",
                idx: i,
                start: p,
                orig: { ...r },
              });
            }}
            className={`absolute ${active ? "z-40 cursor-move" : "z-30 cursor-pointer"}`}
            style={{
              left: `${r.x}%`,
              top: `${r.y}%`,
              width: `${r.w}%`,
              height: `${r.h}%`,
              transform: `rotate(${r.rot ?? 0}deg)`,
              transformOrigin: "center",
              border: active ? "2.5px solid hsl(210 90% 54%)" : "2px solid hsl(8 80% 60%)",
              background: active ? "hsla(210,90%,54%,0.25)" : "hsla(8,80%,60%,0.10)",
            }}
          >
            <div
              className={`w-full h-full flex flex-col items-center justify-center font-bold pointer-events-none ${
                active ? "text-[hsl(210_90%_40%)]" : "text-[hsl(8_70%_45%)]"
              }`}
            >
              <div className="text-2xl leading-none">{i + 1}</div>
              {active && <div className="text-[10px] opacity-80 mt-0.5">{r.rot ?? 0} deg</div>}
            </div>

            {active && (
              <>
                {/* corner resize handles */}
                {(["nw", "ne", "sw", "se"] as const).map((c) => (
                  <div
                    key={c}
                    data-testid={`slot-${i}-resize-${c}`}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.setPointerCapture(e.pointerId);
                      startDrag({
                        type: "resize",
                        idx: i,
                        corner: c,
                        orig: { ...r },
                      });
                    }}
                    className="absolute z-50 w-4 h-4 rounded-full bg-[hsl(150_60%_50%)] border-2 border-white shadow flex items-center justify-center cursor-nwse-resize"
                    style={{
                      left: c.includes("w") ? -8 : undefined,
                      right: c.includes("e") ? -8 : undefined,
                      top: c.includes("n") ? -8 : undefined,
                      bottom: c.includes("s") ? -8 : undefined,
                      cursor: c === "nw" || c === "se" ? "nwse-resize" : "nesw-resize",
                    }}
                  >
                    <Move className="w-2.5 h-2.5 text-white" />
                  </div>
                ))}
                {/* rotate handle */}
                <div
                  data-testid={`slot-${i}-rotate`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    const el = containerRef.current!;
                    const b = el.getBoundingClientRect();
                    const cx = ((r.x + r.w / 2) / 100) * b.width + b.left;
                    const cy = ((r.y + r.h / 2) / 100) * b.height + b.top;
                    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
                    startDrag({
                      type: "rotate",
                      idx: i,
                      center: {
                        x: ((cx - b.left) / b.width) * 100,
                        y: ((cy - b.top) / b.height) * 100,
                      },
                      startAngle,
                      origRot: r.rot ?? 0,
                      orig: { ...r },
                    });
                  }}
                  className="absolute left-1/2 -translate-x-1/2 -top-9 w-7 h-7 rounded-full bg-[hsl(45_95%_55%)] border-2 border-white shadow flex items-center justify-center cursor-grab"
                  title="Putar slot"
                >
                  <RotateCw className="w-3.5 h-3.5 text-white" />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
