import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useStudio } from "@/lib/studio-store";
import { toast } from "sonner";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FolderOpen,
  RotateCcw,
  FolderCheck,
  CheckCircle2,
  Play,
  Image as ImageIcon,
  Zap,
  Archive,
} from "lucide-react";
import { DEMO_FRAME, DEMO_SESSION_NAME, DEMO_SESSION_PHOTOS } from "@/lib/demo-session";
import {
  createStudioPhotos,
  isAbortError,
  pickLocalPhotoDirectory,
  supportsLocalDirectoryPicker,
} from "@/lib/local-file-access";

export const Route = createFileRoute("/admin/session")({
  component: SessionScreen,
});

type SessionPresetId = "standard" | "couple" | "group" | "custom";

const STATUS_LABEL: Record<string, string> = {
  idle: "Menunggu folder",
  folder_selected: "Folder dipilih",
  frame_selected: "Customer memilih frame",
  photo_selection: "Customer memilih foto",
  editing: "Customer mengedit",
  awaiting_payment: "Menunggu pembayaran",
  ready_to_export: "Siap export",
  exported: "Sudah di-export",
};

function sanitizeFolderName(name: string) {
  const trimmed = name.trim();
  const cleaned = trimmed.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "-");
  return cleaned || "Customer-001";
}

function SessionScreen() {
  const {
    status,
    folderName,
    sessionName,
    targetPhotos,
    photoCount,
    ignoredCount,
    failedCount,
    selectFolder,
    setSessionName,
    setTargetPhotos,
    resetSession,
    exportedAt,
    sessionQueue,
    workflow,
    addCustomFrame,
  } = useStudio();
  const navigate = useNavigate();
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [readingFolder, setReadingFolder] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const dateStr = "2026-06-05";
  const safeName = sanitizeFolderName(sessionName || "Customer-001");
  const folderPreview = `D:/SelfPhoto/${dateStr}/${safeName}`;
  const nameAdjusted = sessionName.length > 0 && safeName !== sessionName.trim();
  useEffect(() => {
    folderInputRef.current?.setAttribute("webkitdirectory", "");
    folderInputRef.current?.setAttribute("directory", "");
  }, []);

  const commitLocalPhotos = useCallback(
    ({
      rootName,
      photos,
      ignored,
      failed,
    }: {
      rootName: string;
      photos: ReturnType<typeof createStudioPhotos>;
      ignored: number;
      failed: number;
    }) => {
      if (photos.length === 0) {
        toast.error("Folder tidak berisi JPG/PNG/WEBP yang valid");
        return;
      }
      if (photos.length < targetPhotos) {
        setTargetPhotos(photos.length);
        toast.warning(`Hanya ada ${photos.length} foto valid. Target foto disesuaikan.`);
      }
      selectFolder(rootName || folderPreview, photos, { ignored, failed });
      toast.success(`${photos.length} foto lokal siap dipilih`);
    },
    [folderPreview, selectFolder, setTargetPhotos, targetPhotos],
  );

  const pickFolder = async () => {
    if (!supportsLocalDirectoryPicker()) {
      folderInputRef.current?.click();
      return;
    }

    setReadingFolder(true);
    try {
      const result = await pickLocalPhotoDirectory();
      commitLocalPhotos(result);
    } catch (error) {
      if (!isAbortError(error)) {
        toast.error("Gagal membaca folder lokal. Coba pilih folder lewat fallback browser.");
        folderInputRef.current?.click();
      }
    } finally {
      setReadingFolder(false);
    }
  };

  const loadDemoSession = useCallback(() => {
    setSessionName(DEMO_SESSION_NAME);
    setTargetPhotos(4);
    addCustomFrame(DEMO_FRAME);
    selectFolder("Demo-Session/Local-Photos", DEMO_SESSION_PHOTOS, { ignored: 0, failed: 0 });
    toast.success("Data uji lokal siap: 8 foto + 1 frame proof");
  }, [addCustomFrame, selectFolder, setSessionName, setTargetPhotos]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("demo") === "1") {
      loadDemoSession();
    }
  }, [loadDemoSession]);

  const handleFolderFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const all = Array.from(files);
    const valid = all.filter((file) => /\.(jpe?g|png|webp)$/i.test(file.name));
    const ignored = all.length - valid.length;
    const root =
      valid[0]?.webkitRelativePath?.split("/")[0] ||
      valid[0]?.name?.replace(/\.[^.]+$/, "") ||
      safeName;
    const photos = createStudioPhotos(
      valid.map((file) => ({ file, relativePath: file.webkitRelativePath || file.name })),
    );
    commitLocalPhotos({ rootName: root || folderPreview, photos, ignored, failed: 0 });
  };

  const applyPreset = (preset: SessionPresetId) => {
    setActivePreset(preset);
    if (preset === "standard") {
      setTargetPhotos(workflow.defaultTargetPhotos || 10);
      if (!sessionName) setSessionName("Customer-Standard");
      toast.success("Preset Paket Standard diterapkan");
    } else if (preset === "couple") {
      setTargetPhotos(10);
      if (!sessionName) setSessionName("Couple-Session");
      toast.success("Preset Paket Couple diterapkan");
    } else if (preset === "group") {
      setTargetPhotos(15);
      if (!sessionName) setSessionName("Group-Session");
      toast.success("Preset Paket Group diterapkan");
    } else {
      toast("Custom Session — isi parameter manual.");
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Session</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pilih folder hasil sesi foto lokal. Tidak ada upload cloud.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <div className="font-semibold text-sm">Quick Start</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "standard", l: "Paket Standard", d: "10 foto · PNG" },
            { id: "couple", l: "Paket Couple", d: "10 foto · couple" },
            { id: "group", l: "Paket Group", d: "15 foto · banyak slot" },
            { id: "custom", l: "Custom Session", d: "Isi manual" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id as SessionPresetId)}
              aria-pressed={activePreset === p.id}
              className={`text-left p-3 rounded-lg border transition-colors ${
                activePreset === p.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary hover:bg-primary/5"
              }`}
            >
              <div className="text-sm font-medium">{p.l}</div>
              <div className="text-[11px] text-muted-foreground">{p.d}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
                Nama Session / Customer
              </div>
              <input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Customer-001"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              />
              <div className="mt-1 text-[11px] text-muted-foreground font-mono truncate">
                {folderPreview}
              </div>
              {nameAdjusted && (
                <div className="text-[11px] text-[var(--warning)] mt-0.5">
                  Nama folder disesuaikan agar aman untuk file system.
                </div>
              )}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
                Target Foto Terpilih
              </div>
              <input
                type="number"
                min={1}
                max={20}
                value={targetPhotos}
                onChange={(e) => setTargetPhotos(Number(e.target.value) || 10)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              />
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
              Output Mode
            </div>
            <div className="px-3 py-2 rounded-md border border-border bg-muted/30 text-sm">
              Simpan PNG ke folder
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <input
              ref={folderInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                handleFolderFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Folder Aktif
                </div>
                <div className="font-medium mt-1 text-sm">
                  {folderName ?? "Belum ada folder dipilih"}
                </div>
                {!folderName && (
                  <div className="text-[11px] text-[var(--warning)] mt-1 space-y-0.5">
                    <div>● Draft session belum dimulai</div>
                    <div>● Folder belum dipilih</div>
                    <div>● Customer flow belum bisa dimulai</div>
                  </div>
                )}
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                {STATUS_LABEL[status]}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={pickFolder}
                disabled={readingFolder}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                <FolderOpen className="w-4 h-4" />
                {readingFolder
                  ? "Membaca Folder..."
                  : folderName
                    ? "Ganti Folder Foto"
                    : "Pilih Folder Foto"}
              </button>
              <button
                onClick={resetSession}
                disabled={status === "idle"}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm hover:bg-muted disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Session
              </button>
              <button
                onClick={loadDemoSession}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-primary/40 text-primary bg-primary/5 text-sm font-medium hover:bg-primary/10"
                title="Muat foto dan frame lokal bawaan untuk uji cepat sampai export."
              >
                <Zap className="w-4 h-4" />
                Muat Data Uji Lokal
              </button>
            </div>

            {folderName && (
              <div className="mt-5 grid grid-cols-3 gap-4 pt-5 border-t border-border">
                <Stat label="Foto valid" value={photoCount} highlight />
                <Stat label="Diabaikan" value={ignoredCount} />
                <Stat label="Gagal dibaca" value={failedCount} />
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Aksi Lanjut
          </div>
          <button
            onClick={() => navigate({ to: "/customer/welcome" })}
            disabled={!folderName}
            className="w-full mb-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" /> Mulai Customer Flow
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
            F11 untuk mode fullscreen
          </p>
          {!folderName && (
            <p className="text-[11px] text-muted-foreground mb-2">
              Tombol aktif setelah folder valid dipilih.
            </p>
          )}
          <button
            disabled={status !== "exported"}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm hover:bg-muted disabled:opacity-50"
          >
            <FolderCheck className="w-4 h-4" />
            Buka Folder Output
          </button>
          {exportedAt && (
            <div className="mt-3 text-xs flex items-center gap-1.5 text-[var(--success)]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Export pada {new Date(exportedAt).toLocaleTimeString("id-ID")}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="text-sm font-medium mb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          Session Hari Ini
        </div>
        <div className="grid grid-cols-2 gap-2">
          {sessionQueue.map((s) => {
            const tone =
              s.status === "exported"
                ? "text-[var(--success)] border-[var(--success)]/30 bg-[var(--success)]/5"
                : s.status === "awaiting_payment"
                  ? "text-[var(--warning)] border-[var(--warning)]/30 bg-[var(--warning)]/5"
                  : "text-foreground border-border";
            return (
              <div
                key={s.id}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md border ${tone}`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{s.label}</div>
                  <div className="text-[11px] opacity-80">{STATUS_LABEL[s.status]}</div>
                </div>
                {s.status === "exported" ? (
                  <button className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted">
                    <Archive className="w-3 h-3" /> Archive
                  </button>
                ) : (
                  <button className="text-[11px] px-2 py-1 rounded border border-border hover:bg-muted">
                    Resume
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="text-sm font-medium mb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          Status Step Customer
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            "folder_selected",
            "frame_selected",
            "photo_selection",
            "editing",
            "awaiting_payment",
            "ready_to_export",
            "exported",
          ].map((s) => {
            const active = status === s;
            return (
              <span
                key={s}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {STATUS_LABEL[s]}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={`text-2xl font-semibold mt-1 ${
          highlight ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
