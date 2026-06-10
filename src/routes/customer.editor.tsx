import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { FRAMES, useStudio } from "@/lib/studio-store";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Minus,
  Move,
  Plus,
  RotateCcw,
  RotateCw,
  ShieldAlert,
  Copy as CopyIcon,
  Wand2 as Wand2All,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { BackButton } from "@/components/customer-shell";
import { FrameCanvas } from "@/components/frame-canvas";
import { FlowTimer } from "@/components/flow-timer";

export const Route = createFileRoute("/customer/editor")({
  component: Editor,
});

function Editor() {
  const {
    folderName,
    selectedFrameIds,
    selectedPhotoIds,
    slotMaps,
    currentFrameId,
    setCurrentFrame,
    assignSlot,
    autoFillFrame,
    resetFrame,
    setStatus,
    rotateSlot,
    rotations,
    zoomSlot,
    nudgeSlot,
    resetSlotTransform,
    slotTransforms,
    editorTimerSec,
    frameQuantities,
    autoFillAll,
    resetAllFrames,
    copyLayoutFromPrevious,
    adminMode,
    toggleAdminMode,
    extendTimer,
    workflow,
    customFrames,
    sessionPhotos,
  } = useStudio();
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(0);
  const [zoom, setZoom] = useState(100);
  const allFrames = [...customFrames, ...FRAMES];
  const photos = sessionPhotos;

  if (!folderName) return <Navigate to="/admin/session" />;
  if (selectedFrameIds.length === 0) return <Navigate to="/customer/frame" />;
  if (photos.length === 0) return <Navigate to="/admin/session" />;

  // Build instance list: each frame can appear multiple times (qty)
  const instances: { key: string; frameId: string; copy: number; total: number }[] = [];
  selectedFrameIds.forEach((fid) => {
    const qty = Math.max(1, frameQuantities[fid] ?? 1);
    for (let i = 1; i <= qty; i++) {
      instances.push({ key: `${fid}#${i}`, frameId: fid, copy: i, total: qty });
    }
  });
  const frameKey =
    currentFrameId && instances.some((x) => x.key === currentFrameId)
      ? currentFrameId
      : (instances[0]?.key ?? "");
  const current = instances.find((x) => x.key === frameKey) ?? instances[0];
  const frame = allFrames.find((f) => f.id === current.frameId)!;
  const slotMap = slotMaps[frameKey] ?? [];
  const activeSlotPhoto = selectedSlot !== null ? slotMap[selectedSlot] : null;
  const activeRotation =
    selectedSlot !== null ? (rotations[`${frameKey}:${selectedSlot}`] ?? 0) : 0;
  const activeTransform =
    selectedSlot !== null
      ? (slotTransforms[`${frameKey}:${selectedSlot}`] ?? { scale: 1, x: 0, y: 0 })
      : { scale: 1, x: 0, y: 0 };
  const canTransform = selectedSlot !== null && !!activeSlotPhoto;

  const allFilled = instances.every((inst) => {
    const fr = allFrames.find((f) => f.id === inst.frameId)!;
    const sm = slotMaps[inst.key] ?? [];
    return sm.filter(Boolean).length === fr.slots;
  });

  const hasPremium = instances.some(
    (inst) => allFrames.find((f) => f.id === inst.frameId)?.premium,
  );
  const hasPrevInstance = instances.findIndex((x) => x.key === frameKey) > 0;
  const canCopyLayout = (() => {
    const idx = instances.findIndex((x) => x.key === frameKey);
    if (idx <= 0) return false;
    const prev = instances[idx - 1];
    const a = allFrames.find((f) => f.id === prev.frameId)!.slots;
    return a === frame.slots;
  })();

  const onPhotoClick = (photoId: string) => {
    if (selectedSlot === null) return;
    assignSlot(frameKey, selectedSlot, photoId);
    if (selectedSlot < frame.slots - 1) setSelectedSlot(selectedSlot + 1);
  };

  const switchFrame = (dir: 1 | -1) => {
    const i = instances.findIndex((x) => x.key === frameKey);
    const n = (i + dir + instances.length) % instances.length;
    setCurrentFrame(instances[n].key);
    setSelectedSlot(0);
  };

  return (
    <div className="flex-1 px-6 py-6 grid grid-cols-[260px_1fr_300px] gap-4 min-h-0">
      {/* Tools (left) */}
      <aside className="bg-card border border-border rounded-xl p-4 flex flex-col min-h-0 overflow-auto">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Tools</div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => autoFillFrame(frameKey)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium"
          >
            <Wand2 className="w-3.5 h-3.5" /> Auto Isi
          </button>
          <button
            onClick={() => resetFrame(frameKey)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-border text-xs hover:bg-muted"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Frame
          </button>
          <button
            onClick={() => autoFillAll()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-primary/40 text-primary text-xs font-medium hover:bg-primary/5"
          >
            <Wand2All className="w-3.5 h-3.5" /> Auto Isi Semua
          </button>
          <button
            onClick={() => resetAllFrames()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-border text-xs hover:bg-muted"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Semua
          </button>
          <button
            onClick={() => copyLayoutFromPrevious(frameKey)}
            disabled={!canCopyLayout}
            title={
              canCopyLayout
                ? "Salin layout dari frame sebelumnya"
                : hasPrevInstance
                  ? "Jumlah slot berbeda"
                  : "Tidak ada frame sebelumnya"
            }
            className="col-span-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-40"
          >
            <CopyIcon className="w-3.5 h-3.5" /> Copy Layout dari sebelumnya
          </button>
          <button
            onClick={() =>
              selectedSlot !== null && activeSlotPhoto && rotateSlot(frameKey, selectedSlot)
            }
            disabled={selectedSlot === null || !activeSlotPhoto}
            aria-label="Rotate 90 derajat"
            title={activeSlotPhoto ? "Putar foto 90°" : "Pilih slot berisi foto dulu"}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-50"
          >
            <RotateCw className="w-3.5 h-3.5" /> Rotate 90° · {activeRotation}°
          </button>
        </div>

        <div className="rounded-md border border-border p-2 mb-3 space-y-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center justify-between">
            <span>Foto Slot · Zoom & Geser</span>
            <span className="font-mono text-foreground">
              {Math.round(activeTransform.scale * 100)}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => canTransform && zoomSlot(frameKey, selectedSlot!, -0.03)}
              disabled={!canTransform}
              aria-label="Perkecil foto"
              className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-50"
            >
              <Minus className="w-3 h-3" /> Zoom −
            </button>
            <button
              onClick={() => canTransform && zoomSlot(frameKey, selectedSlot!, 0.03)}
              disabled={!canTransform}
              aria-label="Perbesar foto"
              className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-50"
            >
              <Plus className="w-3 h-3" /> Zoom +
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div />
            <button
              onClick={() => canTransform && nudgeSlot(frameKey, selectedSlot!, 0, -1.5)}
              disabled={!canTransform}
              aria-label="Geser ke atas"
              className="px-2 py-1.5 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-50"
            >
              ↑
            </button>
            <div />
            <button
              onClick={() => canTransform && nudgeSlot(frameKey, selectedSlot!, -1.5, 0)}
              disabled={!canTransform}
              aria-label="Geser ke kiri"
              className="px-2 py-1.5 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-50"
            >
              ←
            </button>
            <button
              onClick={() => canTransform && resetSlotTransform(frameKey, selectedSlot!)}
              disabled={!canTransform}
              aria-label="Reset posisi foto"
              title="Reset zoom & posisi"
              className="px-2 py-1.5 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-50 inline-flex items-center justify-center"
            >
              <Move className="w-3 h-3" />
            </button>
            <button
              onClick={() => canTransform && nudgeSlot(frameKey, selectedSlot!, 1.5, 0)}
              disabled={!canTransform}
              aria-label="Geser ke kanan"
              className="px-2 py-1.5 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-50"
            >
              →
            </button>
            <div />
            <button
              onClick={() => canTransform && nudgeSlot(frameKey, selectedSlot!, 0, 1.5)}
              disabled={!canTransform}
              aria-label="Geser ke bawah"
              className="px-2 py-1.5 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-50"
            >
              ↓
            </button>
            <div />
          </div>
        </div>

        <div
          className={`rounded-md border p-2 mb-3 ${
            adminMode
              ? "border-[var(--warning)]/40 bg-[var(--warning)]/5"
              : "border-dashed border-border"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Mode Admin
            </div>
            <button
              onClick={toggleAdminMode}
              className={`text-[10px] px-2 py-0.5 rounded border ${
                adminMode
                  ? "border-[var(--warning)]/40 text-[var(--warning)]"
                  : "border-border text-muted-foreground"
              }`}
            >
              {adminMode ? "Aktif" : "Aktifkan"}
            </button>
          </div>
          {adminMode && (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => extendTimer("editor", 120)}
                className="px-2 py-1 rounded-md border border-border text-[10px] hover:bg-muted"
              >
                +2 menit
              </button>
              <button
                onClick={() => resetFrame(frameKey)}
                className="px-2 py-1 rounded-md border border-border text-[10px] hover:bg-muted"
              >
                Reset frame aktif
              </button>
            </div>
          )}
          <p className="text-[9px] text-muted-foreground italic mt-1">
            Produksi nanti memakai PIN/staff login.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => switchFrame(-1)}
            disabled={instances.length < 2}
            aria-label="Frame sebelumnya"
            title="Frame sebelumnya"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <button
            onClick={() => switchFrame(1)}
            disabled={instances.length < 2}
            aria-label="Frame berikutnya"
            title="Frame berikutnya"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-40"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mb-3">
          <label className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Zoom: {zoom}%
          </label>
          <input
            type="range"
            min={60}
            max={140}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Slot aktif:{" "}
          <span className="text-foreground font-medium">
            {selectedSlot !== null ? `${selectedSlot + 1}` : "—"}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
            Frame ({instances.length})
          </div>
          <div className="grid grid-cols-2 gap-2">
            {instances.map((inst) => {
              const f = allFrames.find((x) => x.id === inst.frameId)!;
              const sm = slotMaps[inst.key] ?? [];
              const filled = sm.filter(Boolean).length;
              const active = inst.key === frameKey;
              return (
                <button
                  key={inst.key}
                  onClick={() => {
                    setCurrentFrame(inst.key);
                    setSelectedSlot(0);
                  }}
                  title={`${f.name}${inst.total > 1 ? ` (${inst.copy})` : ""}`}
                  className={`p-1.5 rounded-md border-2 text-left ${
                    active ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="aspect-[3/4] mb-1">
                    <FrameCanvas frame={f} slotMap={sm} size="sm" instanceKey={inst.key} />
                  </div>
                  <div className="text-[10px] font-medium truncate">
                    {f.name}
                    {inst.total > 1 && (
                      <span className="text-muted-foreground"> ({inst.copy})</span>
                    )}
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    {filled}/{f.slots}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Canvas */}
      <div className="flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <BackButton to="/customer/photos" />
            <h1 className="text-2xl font-semibold mt-1">
              Atur Foto — {frame.name}
              {current.total > 1 && (
                <span className="text-muted-foreground"> ({current.copy})</span>
              )}
              {frame.premium && (
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[var(--warning)]/15 text-[var(--warning)] font-medium inline-flex items-center gap-0.5 align-middle">
                  <Sparkles className="w-2.5 h-2.5" /> PREMIUM
                </span>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">
              Klik slot, lalu pilih foto dari strip kanan.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FlowTimer
              seconds={editorTimerSec}
              label="Sisa waktu editor"
              onExpire={() => {
                setStatus(hasPremium ? "awaiting_payment" : "ready_to_export");
                navigate({ to: "/customer/review" });
              }}
            />
            <button
              onClick={() => {
                setStatus(
                  hasPremium && workflow.requirePaymentForPremium
                    ? "awaiting_payment"
                    : "ready_to_export",
                );
                navigate({ to: "/customer/review" });
              }}
              disabled={!allFilled}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              Lanjut ke Review <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-card border border-border rounded-xl p-6 flex items-center justify-center overflow-hidden min-h-0">
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ transform: `scale(${zoom / 100})`, transition: "transform 0.2s" }}
          >
            <div className="h-full" style={{ aspectRatio: "3 / 4" }}>
              <FrameCanvas
                frame={frame}
                slotMap={slotMap}
                onSlotClick={setSelectedSlot}
                selectedSlot={selectedSlot}
                instanceKey={frameKey}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right: frame instances + photos */}
      <aside className="bg-card border border-border rounded-xl p-3 flex flex-col min-h-0 overflow-hidden">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          Foto Terpilih
        </div>
        <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 min-h-0 pr-1">
          {selectedPhotoIds.map((id, i) => {
            const photo = photos.find((p) => p.id === id)!;
            const usedAt = slotMap.indexOf(id);
            return (
              <button
                key={id}
                onClick={() => onPhotoClick(id)}
                aria-label={`Pasang foto #${i + 1} ${photo.name}${usedAt >= 0 ? `, terpasang di slot ${usedAt + 1}` : ""}`}
                title={`#${i + 1} ${photo.name}`}
                className="relative rounded-md overflow-hidden border border-border hover:border-primary text-left"
              >
                <div className="relative aspect-[3/4]">
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  {usedAt >= 0 && (
                    <div className="absolute top-1 right-1 px-1.5 h-5 rounded bg-primary text-primary-foreground text-[10px] flex items-center font-semibold">
                      slot {usedAt + 1}
                    </div>
                  )}
                </div>
                <div className="px-2 py-1 text-[11px] leading-tight bg-card">
                  <span className="font-semibold">#{i + 1}</span>{" "}
                  <span className="text-muted-foreground">{photo.id}</span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
