import { createFileRoute } from "@tanstack/react-router";
import { FRAMES, type Frame, useStudio } from "@/lib/studio-store";
import { Plus, Tag, Power, Edit3, CheckCircle2, Save, AlertTriangle, X } from "lucide-react";
import { useRef, useState } from "react";
import { FrameCanvas } from "@/components/frame-canvas";
import { SlotEditorCanvas, type SlotRect } from "@/components/slot-editor-canvas";
import { SaveStatusPill } from "@/components/unsaved-modal";
import { detectSlotsFromImage } from "@/lib/detect-slots";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/frames")({
  component: FrameManager,
});

function FrameManager() {
  const {
    frameMaxQty,
    setFrameMaxQty,
    basicExtraPrice,
    frameCategories,
    frameOverrides,
    setFrameOverride,
    customFrames,
    addCustomFrame,
    updateFrame,
    updateFrameSlots,
  } = useStudio();
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<Frame | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importFileName, setImportFileName] = useState<string>("");
  const [importImage, setImportImage] = useState<string | null>(null);
  const [importDims, setImportDims] = useState<{ w: number; h: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<string>("Semua");
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>(
    Object.fromEntries(FRAMES.map((f) => [f.id, true])),
  );
  const categories = ["Semua", ...frameCategories];
  const effectiveCategory = (f: Frame) => frameOverrides[f.id]?.category ?? f.category;
  const effectivePrice = (f: Frame) => frameOverrides[f.id]?.price ?? f.price;
  const allFrames = [...customFrames, ...FRAMES];
  const list = allFrames.filter((f) => filter === "Semua" || effectiveCategory(f) === filter);

  // form state
  const [form, setForm] = useState({
    name: "",
    category: "Basic",
    premium: false,
    price: 0,
  });

  // slot editor state
  const [activeSlot, setActiveSlot] = useState(0);
  const [slotRects, setSlotRects] = useState<SlotRect[]>([]);
  const [slotDirty, setSlotDirty] = useState(false);
  const [slotSaveState, setSlotSaveState] = useState<"idle" | "saved">("idle");
  const [slotConfirmClose, setSlotConfirmClose] = useState(false);
  const slotRect = slotRects[activeSlot] ?? { x: 0, y: 0, w: 0, h: 0, rot: 0 };
  const updateActiveRect = (patch: Partial<SlotRect>) => {
    setSlotRects((prev) => {
      const next = [...prev];
      next[activeSlot] = { ...next[activeSlot], ...patch };
      return next;
    });
    setSlotDirty(true);
  };
  const slotError = (() => {
    if (slotRects.length < 1) return "Minimal 1 slot sebelum frame aktif";
    for (const r of slotRects) {
      if (r.w <= 0 || r.h <= 0) return "Width/Height harus > 0";
      if (r.x < 0 || r.y < 0 || r.x + r.w > 100 || r.y + r.h > 100)
        return "Slot keluar dari canvas";
    }
    return null;
  })();
  const openEditor = (f: Frame) => {
    setEditing(f);
    setActiveSlot(0);
    setSlotDirty(false);
    setSlotSaveState("idle");
    setSlotRects(f.slotRects.map((r) => ({ ...r, rot: 0 })));
  };
  const [autoDetecting, setAutoDetecting] = useState(false);
  const autoDetectSlots = async () => {
    if (!editing) return;
    if (!editing.image) {
      toast.error("Frame tidak punya gambar untuk dideteksi");
      return;
    }
    setAutoDetecting(true);
    try {
      const found = await detectSlotsFromImage(editing.image);
      if (found.length === 0) {
        toast.error("Tidak ada slot yang terdeteksi. Coba atur manual.");
        return;
      }
      setSlotRects(found);
      setActiveSlot(0);
      setSlotDirty(true);
      toast.success(`Auto-detect: ${found.length} slot ditemukan`);
    } catch (e) {
      console.error(e);
      toast.error("Gagal membaca gambar frame");
    } finally {
      setAutoDetecting(false);
    }
  };
  const closeEditor = () => {
    if (slotDirty) {
      setSlotConfirmClose(true);
      return;
    }
    setEditing(null);
  };

  // Edit Frame (metadata) modal — dirty form
  const [metaEditing, setMetaEditing] = useState<Frame | null>(null);
  const [metaDraft, setMetaDraft] = useState<{
    name: string;
    category: string;
    premium: boolean;
    price: number;
    maxQty: number;
    active: boolean;
  }>({ name: "", category: "Basic", premium: false, price: 0, maxQty: 5, active: true });
  const [metaBaseline, setMetaBaseline] = useState(metaDraft);
  const [metaSave, setMetaSave] = useState<"idle" | "saved">("idle");
  const [metaConfirmClose, setMetaConfirmClose] = useState(false);
  const metaDirty = JSON.stringify(metaDraft) !== JSON.stringify(metaBaseline);
  const openMeta = (f: Frame) => {
    const next = {
      name: f.name,
      category: effectiveCategory(f),
      premium: f.premium,
      price: effectivePrice(f),
      maxQty: frameMaxQty[f.id] ?? 5,
      active: activeMap[f.id] ?? f.active ?? true,
    };
    setMetaEditing(f);
    setMetaDraft(next);
    setMetaBaseline(next);
    setMetaSave("idle");
  };
  const persistMeta = () => {
    if (!metaEditing) return;
    setFrameOverride(metaEditing.id, {
      price: metaDraft.price,
      category: metaDraft.category,
    });
    setFrameMaxQty(metaEditing.id, metaDraft.maxQty);
    setActiveMap((m) => ({ ...m, [metaEditing.id]: metaDraft.active }));
    updateFrame(metaEditing.id, {
      name: metaDraft.name,
      category: metaDraft.category as Frame["category"],
      premium: metaDraft.premium,
      price: metaDraft.price,
      active: metaDraft.active,
    });
    setMetaBaseline(metaDraft);
    setMetaSave("saved");
    setTimeout(() => setMetaSave("idle"), 2000);
  };
  const closeMeta = () => {
    if (metaDirty) {
      setMetaConfirmClose(true);
      return;
    }
    setMetaEditing(null);
  };

  // Import: real file picker
  const handleImportFile = (file: File) => {
    setImportError(null);
    if (file.type !== "image/png" && !/\.png$/i.test(file.name)) {
      setImportError("Frame harus PNG transparan.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setImportError("Ukuran maksimal 20MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setImportImage(dataUrl);
        setImportDims({ w: img.naturalWidth, h: img.naturalHeight });
        setImportFileName(file.name);
        if (!form.name) setForm((f) => ({ ...f, name: file.name.replace(/\.[^.]+$/, "") }));
      };
      img.onerror = () => setImportError("Gambar tidak bisa dibaca.");
      img.src = dataUrl;
    };
    reader.onerror = () => setImportError("Gagal membaca file.");
    reader.readAsDataURL(file);
  };

  const resetImport = () => {
    setImportImage(null);
    setImportDims(null);
    setImportFileName("");
    setImportError(null);
    setForm({ name: "", category: "Basic", premium: false, price: 0 });
  };

  const commitImport = () => {
    if (!importImage) return;
    const id = `custom-${Date.now()}`;
    const newFrame: Frame = {
      id,
      name: form.name || importFileName || "Custom Frame",
      category: (form.category as Frame["category"]) || "Basic",
      slots: 1,
      premium: form.premium,
      price: form.premium ? form.price : 0,
      active: true,
      image: importImage,
      slotRects: [{ x: 25, y: 25, w: 50, h: 50 }],
    };
    addCustomFrame(newFrame);
    setActiveMap((m) => ({ ...m, [id]: true }));
    setShowImport(false);
    resetImport();
    toast.success(`${newFrame.name} ditambahkan · atur slot sekarang`);
    // open slot editor immediately
    setTimeout(() => openEditor(newFrame), 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Frame Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola koleksi frame, kategori, harga premium, dan slot.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Frame Basic: cetakan pertama gratis, ekstra Rp {basicExtraPrice.toLocaleString("id-ID")}
            /cetakan.
          </p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Import Frame PNG
        </button>
      </div>

      <div className="flex gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs border ${
              filter === c
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {list.map((f) => {
          const isActive = activeMap[f.id] ?? f.active ?? true;
          return (
            <div
              key={f.id}
              className={`bg-card border border-border rounded-xl overflow-hidden ${
                !isActive && "opacity-60"
              }`}
            >
              <div className="p-3 bg-muted/30">
                <FrameCanvas frame={f} slotMap={[]} size="sm" />
              </div>
              <div className="p-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm truncate">{f.name}</div>
                  {f.premium && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--warning)]/15 text-[var(--warning)] font-medium">
                      PREMIUM
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                  <Tag className="w-3 h-3" />
                  {effectiveCategory(f)} · {f.slots} slot
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {f.premium ? `Rp ${effectivePrice(f).toLocaleString("id-ID")}` : "Free"} · max{" "}
                  {frameMaxQty[f.id] ?? 5}×
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-3">
                  <button
                    onClick={() => setActiveMap((m) => ({ ...m, [f.id]: !m[f.id] }))}
                    aria-label={`${isActive ? "Nonaktifkan" : "Aktifkan"} ${f.name}`}
                    title={`${isActive ? "Nonaktifkan" : "Aktifkan"} ${f.name}`}
                    className={`inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs border ${
                      isActive
                        ? "border-[var(--success)]/40 text-[var(--success)]"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <Power className="w-3 h-3" /> {isActive ? "On" : "Off"}
                  </button>
                  <button
                    onClick={() => openMeta(f)}
                    aria-label={`Edit ${f.name}`}
                    title={`Edit ${f.name}`}
                    className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs border border-border hover:bg-muted"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => openEditor(f)}
                    aria-label={`Atur slot ${f.name}`}
                    title={`Atur slot ${f.name}`}
                    className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs border border-border hover:bg-muted"
                  >
                    Slot
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-card rounded-xl border border-border w-full max-w-lg p-6 space-y-4">
            <div>
              <div className="text-lg font-semibold">Import Frame PNG</div>
              <p className="text-sm text-muted-foreground mt-1">
                Upload PNG frame baru. Slot akan auto-detect dari area transparan.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Frame Name">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                />
              </Field>
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                >
                  {frameCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Tipe">
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm({ ...form, premium: false })}
                    className={`flex-1 px-3 py-2 rounded-md border text-xs ${
                      !form.premium ? "border-primary bg-primary/10 text-primary" : "border-border"
                    }`}
                  >
                    Free
                  </button>
                  <button
                    onClick={() => setForm({ ...form, premium: true })}
                    className={`flex-1 px-3 py-2 rounded-md border text-xs ${
                      form.premium ? "border-primary bg-primary/10 text-primary" : "border-border"
                    }`}
                  >
                    Premium
                  </button>
                </div>
              </Field>
              <Field label="Harga (Rp)">
                <input
                  type="number"
                  disabled={!form.premium}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm disabled:opacity-50"
                />
              </Field>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImportFile(f);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleImportFile(f);
              }}
              className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground hover:bg-muted"
            >
              {importImage
                ? "Klik untuk pilih file lain"
                : "Klik atau drop file PNG transparan di sini"}
            </button>
            {importError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> {importError}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">
              PNG transparan · maksimal 20MB · setelah import langsung atur slot.
            </p>
            {importImage && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 flex gap-3 items-center">
                <img
                  src={importImage}
                  alt="Preview"
                  className="w-20 h-20 object-contain bg-card border border-border rounded-md"
                />
                <div className="text-xs space-y-1 flex-1 min-w-0">
                  <div className="font-mono truncate">{importFileName}</div>
                  <div className="flex items-center gap-1 text-[var(--success)]">
                    <CheckCircle2 className="w-3 h-3" /> File valid
                  </div>
                  {importDims && (
                    <div className="text-muted-foreground">
                      {importDims.w} × {importDims.h}px
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowImport(false);
                  resetImport();
                }}
                className="px-4 py-2 rounded-md border border-border text-sm"
              >
                Batal
              </button>
              <button
                onClick={commitImport}
                disabled={!importImage}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                Import & Atur Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-card rounded-xl border border-border w-full max-w-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-lg font-semibold">Slot Correction · {editing.name}</div>
                <p className="text-sm text-muted-foreground">Atur posisi & jumlah slot frame.</p>
              </div>
              <button
                onClick={closeEditor}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Tutup
              </button>
            </div>
            <div className="grid grid-cols-[1fr_220px] gap-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <SlotEditorCanvas
                  frame={editing}
                  rects={slotRects}
                  activeIdx={activeSlot}
                  onSelect={setActiveSlot}
                  onChange={(next) => {
                    setSlotRects(next);
                    setSlotDirty(true);
                  }}
                />
                <div className="text-[10px] text-muted-foreground mt-2 text-center">
                  Drag kotak untuk geser · sudut hijau untuk resize · ikon kuning untuk putar
                </div>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[70vh] pr-1">
                <button
                  onClick={autoDetectSlots}
                  disabled={autoDetecting}
                  className="w-full px-3 py-2 rounded-md border border-primary/40 text-primary text-xs font-medium hover:bg-primary/5 inline-flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {autoDetecting ? "Mendeteksi…" : "Auto-detect Slot"}
                </button>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Slot: {slotRects.length}
                </div>
                <div className="flex flex-wrap gap-1">
                  {slotRects.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlot(i)}
                      aria-label={`Pilih slot ${i + 1}`}
                      className={`w-7 h-7 rounded-md text-xs border ${
                        activeSlot === i
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-muted-foreground pt-1">
                  Slot aktif: {activeSlot + 1}
                </div>
                {(["x", "y", "w", "h", "rot"] as const).map((k) => (
                  <label key={k} className="block text-[11px]">
                    <span className="uppercase tracking-wide text-muted-foreground">
                      {k === "rot" ? "rotation (°)" : k}
                    </span>
                    <input
                      type="number"
                      value={Number(slotRect?.[k] ?? 0)}
                      onChange={(e) =>
                        updateActiveRect({ [k]: Number(e.target.value) } as Partial<SlotRect>)
                      }
                      className="w-full mt-0.5 px-2 py-1 rounded-md border border-border bg-background text-xs"
                    />
                  </label>
                ))}
                <button
                  onClick={() => {
                    setSlotRects((p) => [...p, { x: 10, y: 10, w: 25, h: 25, rot: 0 }]);
                    setActiveSlot(slotRects.length);
                    setSlotDirty(true);
                  }}
                  className="w-full px-3 py-2 rounded-md border border-border text-sm hover:bg-muted"
                >
                  + Tambah Slot
                </button>
                <button
                  onClick={() => {
                    if (slotRects.length <= 1) return;
                    setSlotRects((p) => p.filter((_, i) => i !== activeSlot));
                    setActiveSlot((i) => Math.max(0, i - 1));
                    setSlotDirty(true);
                  }}
                  className="w-full px-3 py-2 rounded-md border border-border text-sm hover:bg-muted"
                >
                  − Hapus Slot Aktif
                </button>
                {slotError && <div className="text-[11px] text-destructive">{slotError}</div>}
                <button
                  onClick={() => {
                    if (slotError) return;
                    updateFrameSlots(editing.id, slotRects);
                    setEditing({
                      ...editing,
                      slots: slotRects.length,
                      slotRects: slotRects.map(({ x, y, w, h }) => ({ x, y, w, h })),
                    });
                    setSlotSaveState("saved");
                    setSlotDirty(false);
                    toast.success("Slot frame berhasil disimpan");
                    setTimeout(() => setSlotSaveState("idle"), 1800);
                  }}
                  disabled={!!slotError || !slotDirty}
                  className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                >
                  Simpan Slot
                </button>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      if (editing) {
                        setSlotRects(editing.slotRects.map((r) => ({ ...r, rot: 0 })));
                        setActiveSlot(0);
                        setSlotDirty(false);
                      }
                    }}
                    className="flex-1 px-2 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
                  >
                    Reset
                  </button>
                  <button
                    onClick={closeEditor}
                    className="flex-1 px-2 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
                  >
                    Batal
                  </button>
                </div>
                {slotSaveState === "saved" && (
                  <div className="text-[11px] text-[var(--success)] text-center">
                    ✓ Slot tersimpan
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {metaEditing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-card rounded-xl border border-border w-full max-w-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold">Edit Frame · {metaEditing.name}</div>
                <p className="text-sm text-muted-foreground">Atur metadata frame.</p>
              </div>
              <div className="flex items-center gap-2">
                {metaDirty ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--warning)]/15 text-[var(--warning)] font-medium">
                    ● Belum disimpan
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    ✓ Tersimpan
                  </span>
                )}
                <button
                  onClick={closeMeta}
                  aria-label="Tutup"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[180px_1fr] gap-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <FrameCanvas frame={metaEditing} slotMap={[]} size="sm" />
              </div>
              <div className="space-y-3">
                <Field label="Nama Frame">
                  <input
                    value={metaDraft.name}
                    onChange={(e) => setMetaDraft({ ...metaDraft, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Kategori">
                    <select
                      value={metaDraft.category}
                      onChange={(e) => setMetaDraft({ ...metaDraft, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                    >
                      {frameCategories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Tipe">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMetaDraft({ ...metaDraft, premium: false, price: 0 })}
                        className={`flex-1 px-2 py-2 rounded-md border text-xs ${
                          !metaDraft.premium
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border"
                        }`}
                      >
                        Free
                      </button>
                      <button
                        onClick={() => setMetaDraft({ ...metaDraft, premium: true })}
                        className={`flex-1 px-2 py-2 rounded-md border text-xs ${
                          metaDraft.premium
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border"
                        }`}
                      >
                        Premium
                      </button>
                    </div>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Harga (Rp)">
                    <input
                      type="number"
                      disabled={!metaDraft.premium}
                      value={metaDraft.price}
                      onChange={(e) =>
                        setMetaDraft({ ...metaDraft, price: Number(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm disabled:opacity-50"
                    />
                  </Field>
                  <Field label="Max Cetakan">
                    <input
                      type="number"
                      min={1}
                      value={metaDraft.maxQty}
                      onChange={(e) =>
                        setMetaDraft({
                          ...metaDraft,
                          maxQty: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                    />
                  </Field>
                </div>
                <label className="flex items-center justify-between gap-3">
                  <span className="text-sm">Frame aktif</span>
                  <button
                    type="button"
                    onClick={() => setMetaDraft({ ...metaDraft, active: !metaDraft.active })}
                    aria-pressed={metaDraft.active}
                    aria-label={`${metaDraft.active ? "Nonaktifkan" : "Aktifkan"} frame`}
                    title={`${metaDraft.active ? "Nonaktifkan" : "Aktifkan"} frame`}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      metaDraft.active ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        metaDraft.active ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setMetaDraft(metaBaseline)}
                disabled={!metaDirty}
                className="px-4 py-2 rounded-md border border-border text-sm disabled:opacity-40 hover:bg-muted"
              >
                Reset
              </button>
              <button
                onClick={closeMeta}
                className="px-4 py-2 rounded-md border border-border text-sm hover:bg-muted"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  persistMeta();
                  toast.success("Frame berhasil disimpan");
                  setTimeout(() => setMetaEditing(null), 200);
                }}
                disabled={!metaDirty}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {metaConfirmClose && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-6">
          <div className="bg-card rounded-xl border border-border w-full max-w-sm p-5 space-y-3">
            <div className="font-semibold">Perubahan belum disimpan</div>
            <p className="text-sm text-muted-foreground">Buang perubahan frame ini?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMetaConfirmClose(false)}
                className="px-3 py-1.5 rounded-md border border-border text-sm"
              >
                Tetap di sini
              </button>
              <button
                onClick={() => {
                  setMetaDraft(metaBaseline);
                  setMetaConfirmClose(false);
                  setMetaEditing(null);
                }}
                className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-sm"
              >
                Buang
              </button>
            </div>
          </div>
        </div>
      )}

      {slotConfirmClose && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-6">
          <div className="bg-card rounded-xl border border-border w-full max-w-sm p-5 space-y-3">
            <div className="font-semibold">Perubahan slot belum disimpan</div>
            <p className="text-sm text-muted-foreground">Tutup tanpa menyimpan?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSlotConfirmClose(false)}
                className="px-3 py-1.5 rounded-md border border-border text-sm"
              >
                Tetap di sini
              </button>
              <button
                onClick={() => {
                  setSlotConfirmClose(false);
                  setSlotDirty(false);
                  setEditing(null);
                }}
                className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-sm"
              >
                Buang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}
