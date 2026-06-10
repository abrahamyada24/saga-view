import { describe, expect, it } from "vitest";
import { detectSlotsFromPixels } from "./detect-slots";

function makeFramePixels() {
  const width = 240;
  const height = 320;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = 248;
    data[i * 4 + 1] = 244;
    data[i * 4 + 2] = 236;
    data[i * 4 + 3] = 255;
  }

  const strokeRect = (x: number, y: number, w: number, h: number, t = 4) => {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        const edge = xx < x + t || xx >= x + w - t || yy < y + t || yy >= y + h - t;
        if (!edge) continue;
        const p = (yy * width + xx) * 4;
        data[p] = 90;
        data[p + 1] = 24;
        data[p + 2] = 20;
      }
    }
  };

  for (const x of [40, 132]) {
    for (const y of [45, 125, 205]) strokeRect(x, y, 62, 56);
  }
  return { width, height, data };
}

describe("detectSlotsFromPixels", () => {
  it("detects six separated empty frame slots", () => {
    const slots = detectSlotsFromPixels(makeFramePixels());

    expect(slots).toHaveLength(6);
    expect(slots[0].x).toBeCloseTo(18.75, 0);
    expect(slots[0].y).toBeCloseTo(15.63, 0);
    expect(slots[5].x).toBeGreaterThan(55);
    expect(slots[5].y).toBeGreaterThan(64);
  });
});
