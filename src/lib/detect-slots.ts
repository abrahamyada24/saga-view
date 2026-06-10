import type { SlotRect } from "@/lib/slot-geometry";
import { clamp, round2 } from "@/lib/slot-geometry";

type PixelInput = { width: number; height: number; data: Uint8ClampedArray | Uint8Array };
type Box = { minX: number; minY: number; maxX: number; maxY: number; area: number };

export async function detectSlotsFromImage(src: string): Promise<SlotRect[]> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas tidak tersedia");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return detectSlotsFromPixels(image);
}

export function detectSlotsFromPixels({ width: W, height: H, data }: PixelInput): SlotRect[] {
  if (W < 12 || H < 12) return [];
  const barrier = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const a = data[i * 4 + 3];
    barrier[i] = isSeparatorPixel(r, g, b, a) ? 1 : 0;
  }

  const sealed = dilate(barrier, W, H, Math.max(1, Math.round(Math.min(W, H) * 0.004)));
  const exterior = floodExterior(sealed, W, H);
  const candidates = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) candidates[i] = sealed[i] || exterior[i] ? 0 : 1;

  const boxes = connectedBoxes(candidates, W, H);
  const total = W * H;
  const filtered = boxes.filter((box) => {
    const w = box.maxX - box.minX + 1;
    const h = box.maxY - box.minY + 1;
    if (box.area < total * 0.003 || box.area > total * 0.35) return false;
    if (w < W * 0.06 || h < H * 0.045) return false;
    if (box.area / (w * h) < 0.62) return false;
    const aspect = w / h;
    if (aspect < 0.35 || aspect > 2.8) return false;
    return true;
  });

  return groupRowsThenCols(mergeNearDuplicates(filtered, W, H).map((b) => boxToRect(b, W, H)));
}

function isSeparatorPixel(r: number, g: number, b: number, a: number) {
  if (a < 24) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const sat = max - min;
  return lum < 190 || sat > 42 || (r > 170 && g < 120 && b < 120);
}

function dilate(mask: Uint8Array, W: number, H: number, radius: number) {
  const out = new Uint8Array(mask);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!mask[y * W + x]) continue;
      for (let yy = Math.max(0, y - radius); yy <= Math.min(H - 1, y + radius); yy++) {
        for (let xx = Math.max(0, x - radius); xx <= Math.min(W - 1, x + radius); xx++) {
          out[yy * W + xx] = 1;
        }
      }
    }
  }
  return out;
}

function floodExterior(barrier: Uint8Array, W: number, H: number) {
  const seen = new Uint8Array(W * H);
  const stack: number[] = [];
  const push = (p: number) => {
    if (p < 0 || p >= W * H || barrier[p] || seen[p]) return;
    seen[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < W; x++) {
    push(x);
    push((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    push(y * W);
    push(y * W + W - 1);
  }
  while (stack.length) {
    const p = stack.pop()!;
    const x = p % W;
    if (x > 0) push(p - 1);
    if (x < W - 1) push(p + 1);
    if (p >= W) push(p - W);
    if (p < W * (H - 1)) push(p + W);
  }
  return seen;
}

function connectedBoxes(mask: Uint8Array, W: number, H: number) {
  const seen = new Uint8Array(W * H);
  const boxes: Box[] = [];
  const stack: number[] = [];
  for (let i = 0; i < W * H; i++) {
    if (!mask[i] || seen[i]) continue;
    const box: Box = { minX: W, minY: H, maxX: 0, maxY: 0, area: 0 };
    seen[i] = 1;
    stack.push(i);
    while (stack.length) {
      const p = stack.pop()!;
      const x = p % W;
      const y = (p - x) / W;
      box.minX = Math.min(box.minX, x);
      box.minY = Math.min(box.minY, y);
      box.maxX = Math.max(box.maxX, x);
      box.maxY = Math.max(box.maxY, y);
      box.area++;
      for (const n of [p - 1, p + 1, p - W, p + W]) {
        const nx = n % W;
        if (n < 0 || n >= W * H || Math.abs(nx - x) > 1 || seen[n] || !mask[n]) continue;
        seen[n] = 1;
        stack.push(n);
      }
    }
    boxes.push(box);
  }
  return boxes;
}

function mergeNearDuplicates(boxes: Box[], W: number, H: number) {
  const sorted = [...boxes].sort((a, b) => b.area - a.area);
  const kept: Box[] = [];
  for (const box of sorted) {
    const duplicate = kept.some(
      (k) =>
        intersectionOverUnion(box, k) > 0.72 || centerDistance(box, k) < Math.min(W, H) * 0.025,
    );
    if (!duplicate) kept.push(box);
  }
  return kept;
}

function boxToRect(b: Box, W: number, H: number): SlotRect {
  const pad = Math.max(1, Math.round(Math.min(W, H) * 0.004));
  const x = ((b.minX + pad) / W) * 100;
  const y = ((b.minY + pad) / H) * 100;
  const w = ((b.maxX - b.minX + 1 - pad * 2) / W) * 100;
  const h = ((b.maxY - b.minY + 1 - pad * 2) / H) * 100;
  return {
    x: round2(clamp(x, 0, 99)),
    y: round2(clamp(y, 0, 99)),
    w: round2(clamp(w, 1, 100 - x)),
    h: round2(clamp(h, 1, 100 - y)),
    rot: 0,
  };
}

function intersectionOverUnion(a: Box, b: Box) {
  const ix = Math.max(0, Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX) + 1);
  const iy = Math.max(0, Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY) + 1);
  const intersection = ix * iy;
  const areaA = (a.maxX - a.minX + 1) * (a.maxY - a.minY + 1);
  const areaB = (b.maxX - b.minX + 1) * (b.maxY - b.minY + 1);
  return intersection / (areaA + areaB - intersection);
}

function centerDistance(a: Box, b: Box) {
  return Math.hypot(
    (a.minX + a.maxX - b.minX - b.maxX) / 2,
    (a.minY + a.maxY - b.minY - b.maxY) / 2,
  );
}

function groupRowsThenCols(rects: SlotRect[]) {
  const rows: SlotRect[][] = [];
  for (const r of [...rects].sort((a, b) => a.y - b.y)) {
    const row = rows.find(
      (items) =>
        Math.abs(items[0].y + items[0].h / 2 - (r.y + r.h / 2)) < Math.max(items[0].h, r.h) * 0.55,
    );
    if (row) {
      row.push(r);
    } else {
      rows.push([r]);
    }
  }
  return rows.flatMap((row) => row.sort((a, b) => a.x - b.x));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
