import { describe, expect, it } from "vitest";
import { applySlotInteraction, applySlotRotation } from "./slot-geometry";

describe("slot geometry interactions", () => {
  it("moves a slot with pointer delta and keeps it inside the canvas", () => {
    const next = applySlotInteraction({
      type: "move",
      start: { x: 20, y: 20 },
      current: { x: 130, y: 130 },
      orig: { x: 10, y: 12, w: 30, h: 25, rot: 0 },
    });

    expect(next).toMatchObject({ x: 70, y: 75, w: 30, h: 25 });
  });

  it("resizes from a corner with pixel-level percentage math", () => {
    const next = applySlotInteraction({
      type: "resize",
      corner: "se",
      current: { x: 64.5, y: 70.25 },
      orig: { x: 25, y: 20, w: 30, h: 35, rot: 0 },
    });

    expect(next).toMatchObject({ x: 25, y: 20, w: 39.5, h: 50.25 });
  });

  it("rotates a slot from the rotate handle", () => {
    const next = applySlotRotation(
      { x: 25, y: 25, w: 30, h: 30, rot: 0 },
      { x: 40, y: 40 },
      { x: 40, y: 70 },
      0,
      0,
      1,
    );

    expect(next.rot).toBe(90);
  });
});
