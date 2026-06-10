export type SlotRect = { x: number; y: number; w: number; h: number; rot?: number };

export type SlotPointerPoint = { x: number; y: number };

export type SlotInteraction =
  | { type: "move"; start: SlotPointerPoint; current: SlotPointerPoint; orig: SlotRect }
  | {
      type: "resize";
      corner: "nw" | "ne" | "sw" | "se";
      current: SlotPointerPoint;
      orig: SlotRect;
      minSize?: number;
    }
  | {
      type: "rotate";
      rect: SlotRect;
      center: SlotPointerPoint;
      current: SlotPointerPoint;
      startAngle: number;
      origRot: number;
      snap?: number;
    };

export function clampSlotRect(rect: SlotRect, minSize = 1): SlotRect {
  const w = clamp(rect.w, minSize, 100);
  const h = clamp(rect.h, minSize, 100);
  const x = clamp(rect.x, 0, 100 - w);
  const y = clamp(rect.y, 0, 100 - h);
  return { ...rect, x: round2(x), y: round2(y), w: round2(w), h: round2(h) };
}

export function applySlotInteraction(interaction: SlotInteraction): SlotRect {
  if (interaction.type === "move") {
    const dx = interaction.current.x - interaction.start.x;
    const dy = interaction.current.y - interaction.start.y;
    return clampSlotRect({
      ...interaction.orig,
      x: interaction.orig.x + dx,
      y: interaction.orig.y + dy,
    });
  }

  if (interaction.type === "resize") {
    const minSize = interaction.minSize ?? 1;
    const o = interaction.orig;
    const right = o.x + o.w;
    const bottom = o.y + o.h;
    let x = o.x;
    let y = o.y;
    let w = o.w;
    let h = o.h;

    if (interaction.corner.includes("w")) {
      x = clamp(interaction.current.x, 0, right - minSize);
      w = right - x;
    } else {
      w = clamp(interaction.current.x - o.x, minSize, 100 - o.x);
    }

    if (interaction.corner.includes("n")) {
      y = clamp(interaction.current.y, 0, bottom - minSize);
      h = bottom - y;
    } else {
      h = clamp(interaction.current.y - o.y, minSize, 100 - o.y);
    }

    return clampSlotRect({ ...o, x, y, w, h }, minSize);
  }

  return applySlotRotation(
    interaction.rect,
    interaction.center,
    interaction.current,
    interaction.startAngle,
    interaction.origRot,
    interaction.snap ?? 1,
  );
}

export function applySlotRotation(
  rect: SlotRect,
  center: SlotPointerPoint,
  current: SlotPointerPoint,
  startAngle: number,
  origRot: number,
  snap = 1,
): SlotRect {
  const angle = Math.atan2(current.y - center.y, current.x - center.x) * (180 / Math.PI);
  const delta = angle - startAngle;
  return { ...rect, rot: round2(Math.round((origRot + delta) / snap) * snap) };
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function round2(v: number) {
  return Math.round(v * 100) / 100;
}
