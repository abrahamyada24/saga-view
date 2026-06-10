import { create } from "zustand";
import { persist } from "zustand/middleware";
import frameFilmstripAsset from "@/assets/frames/frame-filmstrip.asset.json";
import frameCinemaAsset from "@/assets/frames/frame-cinema.asset.json";
import frameVintageAsset from "@/assets/frames/frame-vintage.asset.json";
import {
  DEFAULT_DISPLAY_THEME,
  type DisplayTheme,
  normalizeDisplayTheme,
} from "@/lib/display-theme";
import { getBrandFn, updateBrandFn } from "@/lib/api/brand.functions";
import { getSettingsFn, updateSettingsFn } from "@/lib/api/settings.functions";
import { listFramesFn } from "@/lib/api/frame.functions";

export type FrameCategory = "Basic" | "Tema" | "Premium" | (string & {});

export type Frame = {
  id: string;
  name: string;
  category: FrameCategory;
  slots: number;
  premium: boolean;
  price: number;
  image?: string;
  /** CSS preview style for frames without PNG overlay */
  bg?: string;
  border?: string;
  accent?: string;
  active?: boolean;
  /** slot rectangles in % of frame image */
  slotRects: { x: number; y: number; w: number; h: number }[];
};

export type DummyPhoto = { id: string; url: string; name: string };
export type StudioPhoto = DummyPhoto & {
  fileName?: string;
  relativePath?: string;
  source?: "local";
};

export type SessionStatus =
  | "idle"
  | "folder_selected"
  | "frame_selected"
  | "photo_selection"
  | "editing"
  | "awaiting_payment"
  | "ready_to_export"
  | "exported";
export type TimerOnExpire = "add_time" | "call_admin" | "continue";

const filmstripSlots = [
  // left strip 4 + right strip 4
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

// CSS grid-based slot generators
const gridSlots = (cols: number, rows: number, pad = 5, gap = 3) => {
  const w = (100 - pad * 2 - gap * (cols - 1)) / cols;
  const h = (100 - pad * 2 - gap * (rows - 1)) / rows;
  const rects: { x: number; y: number; w: number; h: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rects.push({ x: pad + c * (w + gap), y: pad + r * (h + gap), w, h });
    }
  }
  return rects;
};

const usableFrameAssetUrl = (url?: string) => {
  if (!url || url.startsWith("/__l5e/")) return undefined;
  return url;
};

export const FRAMES: Frame[] = [
  {
    id: "filmstrip",
    name: "Filmstrip Airmail",
    category: "Basic",
    slots: 8,
    premium: false,
    price: 0,
    active: true,
    image: usableFrameAssetUrl(frameFilmstripAsset.url),
    bg: "#fff8df",
    border: "#111111",
    accent: "#e85d75",
    slotRects: filmstripSlots,
  },
  {
    id: "polaroid",
    name: "Polaroid Trio",
    category: "Basic",
    slots: 4,
    premium: false,
    price: 0,
    active: true,
    bg: "#FAF7F2",
    border: "#E7E1D8",
    accent: "#5F7F71",
    slotRects: gridSlots(2, 2, 8, 6),
  },
  {
    id: "minimal-grid",
    name: "Minimal Grid",
    category: "Basic",
    slots: 6,
    premium: false,
    price: 0,
    active: true,
    bg: "#FFFFFF",
    border: "#D9D2C5",
    accent: "#5F7F71",
    slotRects: gridSlots(2, 3, 6, 4),
  },
  {
    id: "cinema",
    name: "Cinema Marquee",
    category: "Tema",
    slots: 6,
    premium: false,
    price: 0,
    active: true,
    image: usableFrameAssetUrl(frameCinemaAsset.url),
    bg: "#141414",
    border: "#f5d76e",
    accent: "#f5d76e",
    slotRects: cinemaSlots,
  },
  {
    id: "pastel-blocks",
    name: "Pastel Blocks",
    category: "Tema",
    slots: 4,
    premium: false,
    price: 0,
    active: true,
    bg: "linear-gradient(135deg,#F5E1DC 0%,#E8D5C4 100%)",
    border: "#D9A7A1",
    accent: "#B5746B",
    slotRects: gridSlots(2, 2, 10, 8),
  },
  {
    id: "sage-editorial",
    name: "Sage Editorial",
    category: "Tema",
    slots: 2,
    premium: false,
    price: 0,
    active: true,
    bg: "#E8EDE6",
    border: "#5F7F71",
    accent: "#3D5749",
    slotRects: [
      { x: 6, y: 10, w: 42, h: 80 },
      { x: 52, y: 10, w: 42, h: 80 },
    ],
  },
  {
    id: "vintage",
    name: "Vintage Gold",
    category: "Premium",
    slots: 4,
    premium: true,
    price: 25000,
    active: true,
    image: usableFrameAssetUrl(frameVintageAsset.url),
    bg: "#f7efe0",
    border: "#c9a961",
    accent: "#8b6f2a",
    slotRects: vintageSlots,
  },
  {
    id: "noir",
    name: "Noir Premium",
    category: "Premium",
    slots: 8,
    premium: true,
    price: 15000,
    active: true,
    bg: "#1A1A1A",
    border: "#C9A961",
    accent: "#C9A961",
    slotRects: gridSlots(2, 4, 5, 3),
  },
];

export const TARGET_PHOTOS = 10;

export type Brand = {
  studioName: string;
  welcome: string;
  primary: string;
  accent: string;
  logo: string | null;
  background: string | null;
  headingFont: string;
  bodyFont: string;
  display: DisplayTheme;
};

const DEFAULT_BRAND: Brand = {
  studioName: "Bachelor Snaps Studio",
  welcome: "Yuk pilih frame & foto terbaikmu!",
  primary: DEFAULT_DISPLAY_THEME.primaryButton,
  accent: DEFAULT_DISPLAY_THEME.accent,
  logo: null,
  background: null,
  headingFont: DEFAULT_DISPLAY_THEME.headingFont,
  bodyFont: DEFAULT_DISPLAY_THEME.bodyFont,
  display: { ...DEFAULT_DISPLAY_THEME },
};

type StudioState = {
  status: SessionStatus;
  folderName: string | null;
  sessionName: string;
  targetPhotos: number;
  photoCount: number;
  ignoredCount: number;
  failedCount: number;
  selectedFrameIds: string[];
  /** quantity per frameId */
  frameQuantities: Record<string, number>;
  /** admin-defined max per frame */
  frameMaxQty: Record<string, number>;
  /** surcharge per extra basic frame copy */
  basicExtraPrice: number;
  /** timer seconds for photo selection step (0 = disabled) */
  photoTimerSec: number;
  /** timer seconds for editor step (0 = disabled) */
  editorTimerSec: number;
  /** list of frame categories (editable) */
  frameCategories: string[];
  /** per-frame overrides: price & category */
  frameOverrides: Record<string, { price?: number; category?: string }>;
  /** workflow defaults (admin) */
  workflow: {
    defaultTargetPhotos: number;
    autoFillDefault: boolean;
    requireReviewBeforeExport: boolean;
    requirePaymentForPremium: boolean;
  };
  /** timer expired action */
  timerOnExpire: TimerOnExpire;
  /** pricing toggle */
  basicExtraEnabled: boolean;
  /** privacy & security toggles */
  privacy: {
    autoClearAfterExport: boolean;
    retentionDays: 1 | 7 | 0; // 0 = manual
    hideFilePathFromCustomer: boolean;
    requireAdminForPayment: boolean;
    blockCustomerAdminRoutes: boolean;
  };
  /** filename pattern */
  filenamePattern: string;
  /** today's sessions queue (prototype) */
  sessionQueue: { id: string; label: string; status: SessionStatus }[];
  /** Real photos selected by admin for this session. Customer flow requires this to be filled. */
  sessionPhotos: StudioPhoto[];
  /** Imported frame files that should be available across admin/customer flow. */
  customFrames: Frame[];
  selectedPhotoIds: string[];
  /** slotMap per frameId */
  slotMaps: Record<string, (string | null)[]>;
  currentFrameId: string | null;
  /** rotation per "frameId:slotIdx" in degrees (0/90/180/270) */
  rotations: Record<string, number>;
  /** scale + offset per "frameId:slotIdx" */
  slotTransforms: Record<string, { scale: number; x: number; y: number }>;
  paymentPaid: boolean;
  adminMode: boolean;
  exportedAt: string | null;
  exportedFiles: string[];
  exportedSaveMode: "folder" | "download" | null;
  brand: Brand;
  outputFolder: string;
  outputDirectoryHandle: unknown | null;
  outputFormat: "PNG" | "JPG";
  resolution: "4R" | "Postcard" | "Square";
  dpi: number;

  selectFolder: (
    name: string,
    photos?: StudioPhoto[],
    counts?: { ignored?: number; failed?: number },
  ) => void;
  setSessionPhotos: (photos: StudioPhoto[]) => void;
  setSessionName: (s: string) => void;
  setTargetPhotos: (n: number) => void;
  resetSession: () => void;
  toggleFrame: (id: string) => void;
  setFrameQty: (id: string, qty: number) => void;
  setFrameMaxQty: (id: string, max: number) => void;
  setBasicExtraPrice: (n: number) => void;
  setPhotoTimer: (n: number) => void;
  setEditorTimer: (n: number) => void;
  addFrameCategory: (name: string) => void;
  removeFrameCategory: (name: string) => void;
  setFrameOverride: (id: string, patch: { price?: number; category?: string }) => void;
  addCustomFrame: (frame: Frame) => void;
  updateFrame: (id: string, patch: Partial<Frame>) => void;
  updateFrameSlots: (id: string, slotRects: Frame["slotRects"]) => void;
  setCurrentFrame: (id: string) => void;
  togglePhoto: (id: string) => void;
  goToEditor: () => void;
  assignSlot: (frameId: string, slotIdx: number, photoId: string | null) => void;
  autoFillFrame: (frameId: string) => void;
  resetFrame: (frameId: string) => void;
  rotateSlot: (frameId: string, slotIdx: number) => void;
  zoomSlot: (frameId: string, slotIdx: number, delta: number) => void;
  nudgeSlot: (frameId: string, slotIdx: number, dx: number, dy: number) => void;
  resetSlotTransform: (frameId: string, slotIdx: number) => void;
  setStatus: (s: SessionStatus) => void;
  payPremium: () => void;
  toggleAdminMode: () => void;
  exportPng: (files?: string[], saveMode?: StudioState["exportedSaveMode"]) => void;
  updateBrand: (b: Partial<Brand>) => void;
  resetBrand: () => void;
  setOutput: (
    o: Partial<Pick<StudioState, "outputFolder" | "outputFormat" | "resolution" | "dpi">>,
  ) => void;
  setOutputDirectoryHandle: (handle: unknown | null, label?: string) => void;
  setWorkflow: (w: Partial<StudioState["workflow"]>) => void;
  setPrivacy: (p: Partial<StudioState["privacy"]>) => void;
  setTimerOnExpire: (v: StudioState["timerOnExpire"]) => void;
  setBasicExtraEnabled: (v: boolean) => void;
  setFilenamePattern: (s: string) => void;
  addQueueItem: (item: { id: string; label: string; status: SessionStatus }) => void;
  autoFillAll: () => void;
  resetAllFrames: () => void;
  copyLayoutFromPrevious: (targetKey: string) => boolean;
  extendTimer: (which: "photo" | "editor", seconds: number) => void;
  serverFrames: Frame[];
  initFromServer: () => Promise<void>;
};

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      status: "idle",
      folderName: null,
      sessionName: "",
      targetPhotos: TARGET_PHOTOS,
      photoCount: 0,
      ignoredCount: 0,
      failedCount: 0,
      selectedFrameIds: [],
      frameQuantities: {},
      frameMaxQty: {
        filmstrip: 3,
        polaroid: 3,
        "minimal-grid": 3,
      },
      basicExtraPrice: 10000,
      photoTimerSec: 120,
      editorTimerSec: 180,
      frameCategories: ["Basic", "Tema", "Premium"],
      frameOverrides: {},
      workflow: {
        defaultTargetPhotos: 10,
        autoFillDefault: true,
        requireReviewBeforeExport: true,
        requirePaymentForPremium: true,
      },
      timerOnExpire: "add_time",
      basicExtraEnabled: true,
      privacy: {
        autoClearAfterExport: true,
        retentionDays: 1,
        hideFilePathFromCustomer: true,
        requireAdminForPayment: true,
        blockCustomerAdminRoutes: true,
      },
      filenamePattern: "{sessionName}_Frame-{frameName}-{index}.png",
      sessionQueue: [
        { id: "Customer-001", label: "Customer-001", status: "exported" },
        { id: "Alya-Rafi", label: "Alya-Rafi", status: "editing" },
        { id: "Bima", label: "Bima", status: "awaiting_payment" },
        { id: "Nadia", label: "Nadia", status: "photo_selection" },
      ],
      serverFrames: [...FRAMES],
      sessionPhotos: [],
      customFrames: [],
      selectedPhotoIds: [],
      slotMaps: {},
      currentFrameId: null,
      rotations: {},
      slotTransforms: {},
      paymentPaid: false,
      adminMode: false,
      exportedAt: null,
      exportedFiles: [],
      exportedSaveMode: null,
      brand: { ...DEFAULT_BRAND },
      outputFolder: "D:/SelfPhoto/Output",
      outputDirectoryHandle: null,
      outputFormat: "PNG",
      resolution: "4R",
      dpi: 300,

      selectFolder: (name, photos = [], counts = {}) =>
        set({
          status: "folder_selected",
          folderName: name,
          photoCount: photos.length,
          ignoredCount: counts.ignored ?? 0,
          failedCount: counts.failed ?? 0,
          sessionPhotos: photos,
          selectedFrameIds: [],
          frameQuantities: {},
          selectedPhotoIds: [],
          slotMaps: {},
          currentFrameId: null,
          paymentPaid: false,
          exportedAt: null,
          exportedFiles: [],
          exportedSaveMode: null,
        }),
      setSessionPhotos: (photos) =>
        set({
          sessionPhotos: photos,
          photoCount: photos.length,
          selectedPhotoIds: [],
          slotMaps: {},
        }),
      setSessionName: (s) => set({ sessionName: s }),
      setTargetPhotos: (n) => set({ targetPhotos: n }),
      resetSession: () =>
        set({
          status: "idle",
          folderName: null,
          sessionName: "",
          photoCount: 0,
          ignoredCount: 0,
          failedCount: 0,
          selectedFrameIds: [],
          frameQuantities: {},
          selectedPhotoIds: [],
          sessionPhotos: [],
          slotMaps: {},
          currentFrameId: null,
          rotations: {},
          slotTransforms: {},
          paymentPaid: false,
          adminMode: false,
          exportedAt: null,
          exportedFiles: [],
          exportedSaveMode: null,
        }),
      toggleFrame: (id) => {
        const { selectedFrameIds, slotMaps, frameQuantities } = get();
        if (selectedFrameIds.includes(id)) {
          const next = selectedFrameIds.filter((f) => f !== id);
          const nextMaps = { ...slotMaps };
          delete nextMaps[id];
          const nextQty = { ...frameQuantities };
          delete nextQty[id];
          set({ selectedFrameIds: next, slotMaps: nextMaps, frameQuantities: nextQty });
        } else {
          const frame = [...get().customFrames, ...get().serverFrames].find((f) => f.id === id)!;
          set({
            selectedFrameIds: [...selectedFrameIds, id],
            slotMaps: { ...slotMaps, [id]: Array(frame.slots).fill(null) },
            frameQuantities: { ...frameQuantities, [id]: 1 },
            status: "frame_selected",
          });
        }
      },
      setFrameQty: (id, qty) => {
        const { frameQuantities, frameMaxQty } = get();
        const frame = [...get().customFrames, ...get().serverFrames].find((f) => f.id === id);
        if (!frame) return;
        const max = frameMaxQty[id] ?? 5;
        const next = Math.max(1, Math.min(max, qty));
        set({ frameQuantities: { ...frameQuantities, [id]: next } });
      },
      setFrameMaxQty: (id, max) => {
        const { frameMaxQty } = get();
        set({ frameMaxQty: { ...frameMaxQty, [id]: Math.max(1, max) } });
      },
      setBasicExtraPrice: (n) => set({ basicExtraPrice: Math.max(0, n) }),
      setPhotoTimer: (n) => set({ photoTimerSec: Math.max(0, n) }),
      setEditorTimer: (n) => set({ editorTimerSec: Math.max(0, n) }),
      addFrameCategory: (name) => {
        const v = name.trim();
        if (!v) return;
        const { frameCategories } = get();
        if (frameCategories.includes(v)) return;
        set({ frameCategories: [...frameCategories, v] });
      },
      removeFrameCategory: (name) => {
        const { frameCategories } = get();
        if (["Basic", "Tema", "Premium"].includes(name)) return;
        set({ frameCategories: frameCategories.filter((c) => c !== name) });
      },
      setFrameOverride: (id, patch) => {
        const { frameOverrides } = get();
        set({
          frameOverrides: {
            ...frameOverrides,
            [id]: { ...(frameOverrides[id] ?? {}), ...patch },
          },
        });
      },
      addCustomFrame: (frame) =>
        set({
          customFrames: [
            { ...frame, slots: frame.slotRects.length, active: frame.active ?? true },
            ...get().customFrames.filter((f) => f.id !== frame.id),
          ],
        }),
      updateFrame: (id, patch) => {
        const update = (f: Frame): Frame => ({
          ...f,
          ...patch,
          slots: patch.slotRects ? patch.slotRects.length : (patch.slots ?? f.slots),
        });
        const { customFrames } = get();
        if (customFrames.some((f) => f.id === id)) {
          set({ customFrames: customFrames.map((f) => (f.id === id ? update(f) : f)) });
          return;
        }
        const override: { price?: number; category?: string } = {};
        if (patch.price !== undefined) override.price = patch.price;
        if (patch.category !== undefined) override.category = patch.category;
        if (Object.keys(override).length > 0) get().setFrameOverride(id, override);
      },
      updateFrameSlots: (id, slotRects) => {
        const { customFrames, selectedFrameIds, slotMaps, frameQuantities } = get();
        const normalized = slotRects.map(({ x, y, w, h }) => ({ x, y, w, h }));
        if (customFrames.some((f) => f.id === id)) {
          set({
            customFrames: customFrames.map((f) =>
              f.id === id ? { ...f, slots: normalized.length, slotRects: normalized } : f,
            ),
          });
        }
        const nextMaps = { ...slotMaps };
        if (selectedFrameIds.includes(id)) {
          const qty = Math.max(1, frameQuantities[id] ?? 1);
          for (let i = 1; i <= qty; i++) {
            const key = `${id}#${i}`;
            const existing = nextMaps[key] ?? [];
            nextMaps[key] = Array(normalized.length)
              .fill(null)
              .map((_, idx) => existing[idx] ?? null);
          }
          set({ slotMaps: nextMaps });
        }
      },
      setCurrentFrame: (id) => set({ currentFrameId: id }),
      togglePhoto: (id) => {
        const { selectedPhotoIds, targetPhotos } = get();
        if (selectedPhotoIds.includes(id)) {
          set({ selectedPhotoIds: selectedPhotoIds.filter((p) => p !== id) });
        } else if (selectedPhotoIds.length < targetPhotos) {
          set({ selectedPhotoIds: [...selectedPhotoIds, id], status: "photo_selection" });
        }
      },
      goToEditor: () => {
        const { selectedFrameIds, selectedPhotoIds, slotMaps, frameQuantities } = get();
        const next: Record<string, (string | null)[]> = {};
        let firstKey: string | null = null;
        selectedFrameIds.forEach((fid) => {
          const frame = [...get().customFrames, ...get().serverFrames].find((f) => f.id === fid)!;
          const qty = Math.max(1, frameQuantities[fid] ?? 1);
          for (let i = 1; i <= qty; i++) {
            const key = `${fid}#${i}`;
            if (!firstKey) firstKey = key;
            const existing = slotMaps[key];
            next[key] =
              existing && existing.length === frame.slots
                ? existing
                : Array(frame.slots)
                    .fill(null)
                    .map((_, j) => selectedPhotoIds[j] ?? null);
          }
        });
        set({
          slotMaps: next,
          status: "editing",
          currentFrameId: firstKey,
        });
      },
      assignSlot: (frameId, slotIdx, photoId) => {
        const { slotMaps } = get();
        const arr = [...(slotMaps[frameId] ?? [])];
        arr[slotIdx] = photoId;
        set({ slotMaps: { ...slotMaps, [frameId]: arr } });
      },
      autoFillFrame: (key) => {
        const { selectedPhotoIds, slotMaps } = get();
        const cur = slotMaps[key];
        if (!cur) return;
        const arr = Array(cur.length)
          .fill(null)
          .map((_, i) => selectedPhotoIds[i] ?? null);
        set({ slotMaps: { ...slotMaps, [key]: arr } });
      },
      resetFrame: (key) => {
        const { slotMaps } = get();
        const cur = slotMaps[key];
        if (!cur) return;
        set({ slotMaps: { ...slotMaps, [key]: Array(cur.length).fill(null) } });
      },
      rotateSlot: (frameId, slotIdx) => {
        const key = `${frameId}:${slotIdx}`;
        const { rotations } = get();
        const next = ((rotations[key] ?? 0) + 90) % 360;
        set({ rotations: { ...rotations, [key]: next } });
      },
      zoomSlot: (frameId, slotIdx, delta) => {
        const key = `${frameId}:${slotIdx}`;
        const { slotTransforms } = get();
        const cur = slotTransforms[key] ?? { scale: 1, x: 0, y: 0 };
        const scale = Math.max(0.5, Math.min(3, cur.scale + delta));
        set({ slotTransforms: { ...slotTransforms, [key]: { ...cur, scale } } });
      },
      nudgeSlot: (frameId, slotIdx, dx, dy) => {
        const key = `${frameId}:${slotIdx}`;
        const { slotTransforms } = get();
        const cur = slotTransforms[key] ?? { scale: 1, x: 0, y: 0 };
        set({
          slotTransforms: {
            ...slotTransforms,
            [key]: { ...cur, x: cur.x + dx, y: cur.y + dy },
          },
        });
      },
      resetSlotTransform: (frameId, slotIdx) => {
        const key = `${frameId}:${slotIdx}`;
        const { slotTransforms } = get();
        const next = { ...slotTransforms };
        delete next[key];
        set({ slotTransforms: next });
      },
      setStatus: (s) => set({ status: s }),
      payPremium: () => set({ paymentPaid: true, status: "ready_to_export" }),
      toggleAdminMode: () => set({ adminMode: !get().adminMode }),
      exportPng: (files = [], saveMode = null) =>
        set({
          status: "exported",
          exportedAt: new Date().toISOString(),
          exportedFiles: files,
          exportedSaveMode: saveMode,
        }),
      updateBrand: (b) => {
        const next = {
          ...get().brand,
          ...b,
          display: normalizeDisplayTheme(b.display ?? get().brand.display),
        };
        set({ brand: next });
        updateBrandFn({ data: next }).catch(console.error);
      },
      resetBrand: () => set({ brand: { ...DEFAULT_BRAND } }),
      setOutput: (o) => set(o),
      setOutputDirectoryHandle: (handle, label) =>
        set({
          outputDirectoryHandle: handle,
          ...(label ? { outputFolder: label } : {}),
        }),
      setWorkflow: (w) => set({ workflow: { ...get().workflow, ...w } }),
      setPrivacy: (p) => set({ privacy: { ...get().privacy, ...p } }),
      setTimerOnExpire: (v) => set({ timerOnExpire: v }),
      setBasicExtraEnabled: (v) => set({ basicExtraEnabled: v }),
      setFilenamePattern: (s) => set({ filenamePattern: s }),
      addQueueItem: (item) => {
        const cur = get().sessionQueue;
        if (cur.some((x) => x.id === item.id)) return;
        set({ sessionQueue: [item, ...cur] });
      },
      autoFillAll: () => {
        const { selectedFrameIds, frameQuantities, slotMaps, selectedPhotoIds } = get();
        const next: Record<string, (string | null)[]> = { ...slotMaps };
        selectedFrameIds.forEach((fid) => {
          const frame = [...get().customFrames, ...get().serverFrames].find((f) => f.id === fid)!;
          const qty = Math.max(1, frameQuantities[fid] ?? 1);
          for (let i = 1; i <= qty; i++) {
            const key = `${fid}#${i}`;
            next[key] = Array(frame.slots)
              .fill(null)
              .map((_, j) => selectedPhotoIds[j] ?? null);
          }
        });
        set({ slotMaps: next });
      },
      resetAllFrames: () => {
        const { selectedFrameIds, frameQuantities, slotMaps } = get();
        const next: Record<string, (string | null)[]> = { ...slotMaps };
        selectedFrameIds.forEach((fid) => {
          const frame = [...get().customFrames, ...get().serverFrames].find((f) => f.id === fid)!;
          const qty = Math.max(1, frameQuantities[fid] ?? 1);
          for (let i = 1; i <= qty; i++) {
            next[`${fid}#${i}`] = Array(frame.slots).fill(null);
          }
        });
        set({ slotMaps: next });
      },
      copyLayoutFromPrevious: (targetKey) => {
        const { selectedFrameIds, frameQuantities, slotMaps } = get();
        const instances: string[] = [];
        selectedFrameIds.forEach((fid) => {
          const qty = Math.max(1, frameQuantities[fid] ?? 1);
          for (let i = 1; i <= qty; i++) instances.push(`${fid}#${i}`);
        });
        const idx = instances.indexOf(targetKey);
        if (idx <= 0) return false;
        const prev = slotMaps[instances[idx - 1]];
        const cur = slotMaps[targetKey];
        if (!prev || !cur || prev.length !== cur.length) return false;
        set({ slotMaps: { ...slotMaps, [targetKey]: [...prev] } });
        return true;
      },
      extendTimer: (which, seconds) => {
        if (which === "photo") set({ photoTimerSec: get().photoTimerSec + seconds });
        else set({ editorTimerSec: get().editorTimerSec + seconds });
      },
      initFromServer: async () => {
        try {
          const [brand, frames, settings] = await Promise.all([
            getBrandFn(),
            listFramesFn(),
            getSettingsFn()
          ]);
          set({
            brand: { ...get().brand, ...brand },
            serverFrames: Array.isArray(frames) ? frames.map((f: any) => ({
              ...f,
              slotRects: typeof f.slotRects === "string" ? JSON.parse(f.slotRects) : f.slotRects,
            })) : get().serverFrames,
            workflow: { ...get().workflow, ...settings.workflow },
            privacy: { ...get().privacy, ...settings.privacy },
            photoTimerSec: settings.photoTimerSec ?? get().photoTimerSec,
            editorTimerSec: settings.editorTimerSec ?? get().editorTimerSec,
            timerOnExpire: settings.timerOnExpire ?? get().timerOnExpire,
            basicExtraPrice: settings.basicExtraPrice ?? get().basicExtraPrice,
            basicExtraEnabled: settings.basicExtraEnabled ?? get().basicExtraEnabled,
            filenamePattern: settings.filenamePattern ?? get().filenamePattern,
            outputFormat: settings.outputFormat ?? get().outputFormat,
            resolution: settings.resolution ?? get().resolution,
            dpi: settings.dpi ?? get().dpi,
            frameCategories: Array.isArray(settings.frameCategories) ? settings.frameCategories : get().frameCategories,
          });
        } catch (err) {
          console.error("Failed to init from server", err);
        }
      },
    }),
    {
      name: "studio-store-v1",
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<StudioState> | undefined;
        return {
          ...currentState,
          ...(persisted ?? {}),
          status: "idle",
          folderName: null,
          photoCount: 0,
          ignoredCount: 0,
          failedCount: 0,
          sessionPhotos: [],
          selectedFrameIds: [],
          frameQuantities: {},
          selectedPhotoIds: [],
          slotMaps: {},
          currentFrameId: null,
          rotations: {},
          slotTransforms: {},
          paymentPaid: false,
          adminMode: false,
          exportedAt: null,
          exportedFiles: [],
          exportedSaveMode: null,
          brand: {
            ...DEFAULT_BRAND,
            ...(persisted?.brand ?? {}),
            display: normalizeDisplayTheme(persisted?.brand?.display),
          },
        };
      },
      partialize: (state) => {
        const {
          adminMode,
          currentFrameId,
          customFrames,
          exportedAt,
          exportedFiles,
          exportedSaveMode,
          failedCount,
          folderName,
          frameQuantities,
          ignoredCount,
          outputDirectoryHandle,
          paymentPaid,
          photoCount,
          rotations,
          selectedFrameIds,
          selectedPhotoIds,
          sessionPhotos,
          slotMaps,
          slotTransforms,
          status,
          ...persisted
        } = state;
        return persisted;
      },
    },
  ),
);
