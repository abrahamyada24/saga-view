import { db } from "./index.server";
import { studios, frames, settings } from "./schema.server";

// ─── Slot Geometry Helpers ──────────────────────────────────────────────────

function gridSlots(cols: number, rows: number, pad = 5, gap = 3) {
  const w = (100 - pad * 2 - gap * (cols - 1)) / cols;
  const h = (100 - pad * 2 - gap * (rows - 1)) / rows;
  const rects: { x: number; y: number; w: number; h: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rects.push({ x: pad + c * (w + gap), y: pad + r * (h + gap), w, h });
    }
  }
  return rects;
}

const filmstripSlots = [
  ...[0, 1, 2, 3].map((i) => ({ x: 9.5, y: 6 + i * 22.5, w: 33, h: 19 })),
  ...[0, 1, 2, 3].map((i) => ({ x: 56, y: 6 + i * 22.5, w: 33, h: 19 })),
];

const cinemaSlots = [
  ...[0, 1, 2].map((i) => ({ x: 4, y: 12 + i * 28, w: 42, h: 24 })),
  ...[0, 1, 2].map((i) => ({ x: 52, y: 12 + i * 28, w: 42, h: 24 })),
];

const vintageSlots = [
  { x: 6, y: 9, w: 38, h: 36 },
  { x: 52, y: 7, w: 42, h: 38 },
  { x: 4, y: 52, w: 40, h: 42 },
  { x: 52, y: 50, w: 42, h: 40 },
];

// ─── Default Frames ─────────────────────────────────────────────────────────

const DEFAULT_FRAMES: (typeof frames.$inferInsert)[] = [
  {
    id: "filmstrip",
    name: "Filmstrip Airmail",
    category: "Basic",
    slots: 8,
    premium: false,
    price: 0,
    bg: "#fff8df",
    border: "#111111",
    accentColor: "#e85d75",
    active: true,
    isDefault: true,
    sortOrder: 0,
    slotRects: JSON.stringify(filmstripSlots),
  },
  {
    id: "polaroid",
    name: "Polaroid Trio",
    category: "Basic",
    slots: 4,
    premium: false,
    price: 0,
    bg: "#FAF7F2",
    border: "#E7E1D8",
    accentColor: "#5F7F71",
    active: true,
    isDefault: true,
    sortOrder: 1,
    slotRects: JSON.stringify(gridSlots(2, 2, 8, 6)),
  },
  {
    id: "minimal-grid",
    name: "Minimal Grid",
    category: "Basic",
    slots: 6,
    premium: false,
    price: 0,
    bg: "#FFFFFF",
    border: "#D9D2C5",
    accentColor: "#5F7F71",
    active: true,
    isDefault: true,
    sortOrder: 2,
    slotRects: JSON.stringify(gridSlots(2, 3, 6, 4)),
  },
  {
    id: "cinema",
    name: "Cinema Marquee",
    category: "Tema",
    slots: 6,
    premium: false,
    price: 0,
    bg: "#141414",
    border: "#f5d76e",
    accentColor: "#f5d76e",
    active: true,
    isDefault: true,
    sortOrder: 3,
    slotRects: JSON.stringify(cinemaSlots),
  },
  {
    id: "pastel-blocks",
    name: "Pastel Blocks",
    category: "Tema",
    slots: 4,
    premium: false,
    price: 0,
    bg: "linear-gradient(135deg,#F5E1DC 0%,#E8D5C4 100%)",
    border: "#D9A7A1",
    accentColor: "#B5746B",
    active: true,
    isDefault: true,
    sortOrder: 4,
    slotRects: JSON.stringify(gridSlots(2, 2, 10, 8)),
  },
  {
    id: "sage-editorial",
    name: "Sage Editorial",
    category: "Tema",
    slots: 2,
    premium: false,
    price: 0,
    bg: "#E8EDE6",
    border: "#5F7F71",
    accentColor: "#3D5749",
    active: true,
    isDefault: true,
    sortOrder: 5,
    slotRects: JSON.stringify([
      { x: 6, y: 10, w: 42, h: 80 },
      { x: 52, y: 10, w: 42, h: 80 },
    ]),
  },
  {
    id: "vintage",
    name: "Vintage Gold",
    category: "Premium",
    slots: 4,
    premium: true,
    price: 25000,
    bg: "#f7efe0",
    border: "#c9a961",
    accentColor: "#8b6f2a",
    active: true,
    isDefault: true,
    sortOrder: 6,
    slotRects: JSON.stringify(vintageSlots),
  },
  {
    id: "noir",
    name: "Noir Premium",
    category: "Premium",
    slots: 8,
    premium: true,
    price: 15000,
    bg: "#1A1A1A",
    border: "#C9A961",
    accentColor: "#C9A961",
    active: true,
    isDefault: true,
    sortOrder: 7,
    slotRects: JSON.stringify(gridSlots(2, 4, 5, 3)),
  },
];

// ─── Default Brand (Retro theme = DISPLAY_THEME_PRESETS[1]) ──────────────────

const DEFAULT_STUDIO: typeof studios.$inferInsert = {
  id: "default",
  studioName: "Bachelor Snaps Studio",
  welcome: "Yuk pilih frame & foto terbaikmu!",
  primary: "#202020",
  accent: "#bcdaea",
  logo: null,
  background: null,
  headingFont: "DM Serif Display",
  bodyFont: "Work Sans",
  displayTheme: JSON.stringify({
    presetId: "retro",
    background: "#bde6c3",
    surface: "#fdf6e3",
    text: "#202020",
    mutedText: "#706a5f",
    border: "#202020",
    accent: "#bcdaea",
    accentText: "#202020",
    primaryButton: "#202020",
    primaryButtonText: "#fff9e8",
    secondaryButton: "#f7c8c8",
    secondaryButtonText: "#202020",
    sidebar: "#fdf6e3",
    sidebarText: "#202020",
    sidebarAccent: "#f7c8c8",
    sidebarAccentText: "#202020",
    sidebarBorder: "#202020",
    decorativeA: "#f7c8c8",
    decorativeB: "#bcdaea",
    decorativeC: "#f6d94f",
    headingFont: "DM Serif Display",
    bodyFont: "Work Sans",
    panelRadius: 18,
    buttonRadius: 14,
  }),
};

const DEFAULT_SETTINGS: typeof settings.$inferInsert = {
  id: "default",
};

// ─── Seed Function ──────────────────────────────────────────────────────────

export async function seedDatabase(): Promise<void> {
  // 1. Seed studios default row
  await db
    .insert(studios)
    .values(DEFAULT_STUDIO)
    .onConflictDoNothing();

  // 2. Seed settings default row
  await db
    .insert(settings)
    .values(DEFAULT_SETTINGS)
    .onConflictDoNothing();

  // 3. Seed default frames (only if table is empty)
  const existingFrames = await db.select({ id: frames.id }).from(frames).limit(1);

  if (existingFrames.length === 0) {
    for (const frame of DEFAULT_FRAMES) {
      await db
        .insert(frames)
        .values(frame)
        .onConflictDoNothing();
    }
  }
}
