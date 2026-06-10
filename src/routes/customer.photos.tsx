import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useStudio } from "@/lib/studio-store";
import { ArrowRight, Filter, Trash2, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/customer-shell";
import { FlowTimer } from "@/components/flow-timer";

export const Route = createFileRoute("/customer/photos")({
  component: PhotoPicker,
});

function PhotoPicker() {
  const {
    folderName,
    selectedFrameIds,
    selectedPhotoIds,
    sessionPhotos,
    targetPhotos,
    togglePhoto,
    goToEditor,
    photoTimerSec,
  } = useStudio();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [onlySelected, setOnlySelected] = useState(false);
  const photos = sessionPhotos;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setActive((i) => Math.min(i + 1, photos.length - 1));
      if (e.key === "ArrowLeft") setActive((i) => Math.max(i - 1, 0));
      if (e.key === " ") {
        e.preventDefault();
        if (photos[active]) togglePhoto(photos[active].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, photos, togglePhoto]);

  useEffect(() => {
    setActive((i) => Math.min(i, Math.max(0, photos.length - 1)));
  }, [photos.length]);

  if (!folderName) return <Navigate to="/admin/session" />;
  if (selectedFrameIds.length === 0) return <Navigate to="/customer/frame" />;

  const ready = selectedPhotoIds.length === targetPhotos;
  const activePhoto = photos[active];
  if (!activePhoto) {
    return (
      <div className="flex-1 px-8 py-6">
        <BackButton to="/customer/frame" />
        <div className="mt-6 rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-semibold">Belum ada foto terbaca</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Kembali ke admin dan pilih folder foto lokal yang berisi JPG/PNG.
          </p>
        </div>
      </div>
    );
  }
  const activeIdx = selectedPhotoIds.indexOf(activePhoto.id);
  const activeSelected = activeIdx >= 0;
  const limitReached = selectedPhotoIds.length >= targetPhotos;

  const visible = onlySelected ? photos.filter((p) => selectedPhotoIds.includes(p.id)) : photos;

  const clearSelection = () => {
    selectedPhotoIds.forEach((id) => togglePhoto(id));
  };
  const autoPick = () => {
    // remove current then add first N
    selectedPhotoIds.forEach((id) => togglePhoto(id));
    setTimeout(() => {
      photos.slice(0, targetPhotos).forEach((p) => togglePhoto(p.id));
    }, 0);
  };

  return (
    <div className="flex-1 px-6 py-4 flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex min-w-0 items-center gap-4">
          <BackButton to="/customer/frame" />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold leading-tight">
              Pilih {targetPhotos} Foto Terbaik
            </h1>
            <p className="text-xs text-muted-foreground">
              Tip: ← → untuk pindah foto, Space untuk pilih/lepas.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <FlowTimer
            seconds={photoTimerSec}
            label="Sisa waktu pilih foto"
            onExpire={() => {
              goToEditor();
              navigate({ to: "/customer/editor" });
            }}
          />
          <div className="text-sm">
            <span className="text-2xl font-semibold text-primary">{selectedPhotoIds.length}</span>
            <span className="text-muted-foreground"> / {targetPhotos} terpilih</span>
          </div>
          <button
            onClick={() => {
              goToEditor();
              navigate({ to: "/customer/editor" });
            }}
            disabled={!ready}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            Lanjut ke Editor
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[minmax(0,1fr)_300px] gap-4 min-h-0">
        <div className="bg-card border border-border rounded-xl flex flex-col p-3 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="text-xs bg-muted px-2 py-1 rounded">
              {activePhoto.name} · {active + 1} / {photos.length}
            </div>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center bg-muted/30 rounded-md overflow-hidden">
            <img
              src={activePhoto.url}
              alt={activePhoto.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="mt-3 flex items-center justify-center gap-3 shrink-0">
            <button
              onClick={() => setActive((i) => Math.max(i - 1, 0))}
              className="px-4 py-2 text-sm rounded-md border border-border bg-card hover:bg-muted"
            >
              ← Sebelumnya
            </button>
            <button
              onClick={() => togglePhoto(activePhoto.id)}
              disabled={!activeSelected && limitReached}
              title={
                !activeSelected && limitReached
                  ? "Lepas salah satu foto dulu untuk mengganti pilihan."
                  : undefined
              }
              className={`px-8 py-2.5 text-base rounded-md font-semibold shadow-sm ${
                activeSelected
                  ? "bg-[var(--warning)]/15 text-[var(--warning)] border border-[var(--warning)]/40"
                  : "bg-primary text-primary-foreground disabled:opacity-50"
              }`}
            >
              {activeSelected ? `Lepas Foto (#${activeIdx + 1})` : "Pilih Foto Ini"}
            </button>
            <button
              onClick={() => setActive((i) => Math.min(i + 1, photos.length - 1))}
              className="px-4 py-2 text-sm rounded-md border border-border bg-card hover:bg-muted"
            >
              Berikutnya →
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-2 px-1 shrink-0">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Galeri ({visible.length})
            </div>
            <button
              onClick={() => setOnlySelected((v) => !v)}
              className={`text-[10px] inline-flex items-center gap-1 px-2 py-1 rounded-md border ${
                onlySelected ? "border-primary text-primary bg-primary/10" : "border-border"
              }`}
            >
              <Filter className="w-3 h-3" /> Terpilih saja
            </button>
          </div>
          <div className="flex gap-1.5 mb-2 px-1 shrink-0">
            <button
              onClick={autoPick}
              className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] px-2 py-1 rounded-md border border-border hover:bg-muted"
              title="Pilih otomatis dari foto lokal pertama"
            >
              <Wand2 className="w-3 h-3" /> Auto pick {targetPhotos}
            </button>
            <button
              onClick={clearSelection}
              disabled={selectedPhotoIds.length === 0}
              className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] px-2 py-1 rounded-md border border-border hover:bg-muted disabled:opacity-40"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 min-h-0 pr-1 auto-rows-max">
            {visible.map((p) => {
              const i = photos.findIndex((x) => x.id === p.id);
              const idx = selectedPhotoIds.indexOf(p.id);
              const selected = idx >= 0;
              const isActive = i === active;
              return (
                <button
                  key={p.id}
                  onClick={() => setActive(i)}
                  aria-label={
                    selected
                      ? `Foto ${p.name}, terpilih nomor ${idx + 1}`
                      : `Foto ${p.name}, belum dipilih`
                  }
                  title={p.name}
                  className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                    isActive
                      ? "border-primary ring-2 ring-primary/30"
                      : selected
                        ? "border-primary/60"
                        : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  {selected && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-semibold">
                      {idx + 1}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {limitReached && (
            <div className="mt-2 text-[11px] text-muted-foreground px-1 shrink-0">
              Lepas salah satu foto dulu untuk mengganti pilihan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
