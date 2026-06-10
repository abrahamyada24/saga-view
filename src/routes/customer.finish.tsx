import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { FRAMES, useStudio } from "@/lib/studio-store";
import { CheckCircle2, FolderOpen, Home, Printer } from "lucide-react";
import { FrameCanvas } from "@/components/frame-canvas";

export const Route = createFileRoute("/customer/finish")({
  component: Finish,
});

function Finish() {
  const {
    folderName,
    sessionName,
    selectedFrameIds,
    slotMaps,
    exportedAt,
    resetSession,
    frameQuantities,
    privacy,
    filenamePattern,
    adminMode,
    customFrames,
    exportedFiles,
    exportedSaveMode,
  } = useStudio();
  const navigate = useNavigate();

  if (!folderName) return <Navigate to="/admin/session" />;

  const allFrames = [...customFrames, ...FRAMES];
  const baseFrames = allFrames.filter((f) => selectedFrameIds.includes(f.id));
  const frames: { frame: (typeof baseFrames)[number]; key: string; copy: number; total: number }[] =
    [];
  baseFrames.forEach((f) => {
    const q = Math.max(1, frameQuantities[f.id] ?? 1);
    for (let i = 1; i <= q; i++) {
      frames.push({ frame: f, key: `${f.id}#${i}`, copy: i, total: q });
    }
  });
  const customerId = sessionName || "Customer-001";
  const dateStr = "2026-06-05";
  const outputPath = `D:/SelfPhoto/${dateStr}/${customerId}/_final_print`;
  const files =
    exportedFiles.length > 0
      ? exportedFiles
      : frames.map((inst, i) =>
          filenamePattern
            .replace("{sessionName}", customerId)
            .replace("{frameName}", inst.frame.name.replace(/\s+/g, "-"))
            .replace("{index}", String(i + 1).padStart(2, "0")),
        );
  const showPath = !privacy.hideFilePathFromCustomer || adminMode;
  const resolvedSaveMode = exportedSaveMode ?? "download";

  return (
    <div className="flex-1 px-8 py-10 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--success)]/15 flex items-center justify-center mb-4 mx-auto">
            <CheckCircle2 className="w-9 h-9 text-[var(--success)]" />
          </div>
          <h1 className="text-3xl font-semibold">Berhasil di-Export!</h1>
          <p className="text-muted-foreground mt-2">
            {resolvedSaveMode === "download"
              ? `${files.length} file PNG dibuat sebagai download browser.`
              : showPath
                ? `${files.length} file PNG sudah disimpan di:`
                : `${files.length} file PNG sudah disimpan di komputer studio.`}
          </p>
          {showPath && resolvedSaveMode !== "download" && (
            <code className="inline-block mt-1 text-xs px-3 py-1 rounded bg-muted">
              {outputPath}
            </code>
          )}
          {resolvedSaveMode === "download" ? (
            <p className="text-[11px] text-muted-foreground mt-1">
              Cek folder download browser. Untuk simpan langsung ke folder, pilih Folder Output di
              admin memakai Chrome/Edge.
            </p>
          ) : !showPath ? (
            <p className="text-[11px] text-muted-foreground mt-1">
              Foto tetap di komputer studio. Tidak ada upload cloud.
            </p>
          ) : null}
          {exportedAt && (
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(exportedAt).toLocaleString("id-ID")}
            </div>
          )}
        </div>

        {frames.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            {frames.map((inst) => (
              <div key={inst.key} className="bg-card border border-border rounded-xl p-4">
                <FrameCanvas
                  frame={inst.frame}
                  slotMap={slotMaps[inst.key] ?? []}
                  size="sm"
                  instanceKey={inst.key}
                />
                <div className="text-xs font-medium mt-2 text-center">
                  {inst.frame.name}
                  {inst.total > 1 && <span className="text-muted-foreground"> ({inst.copy})</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-card border border-border rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            File yang dihasilkan
          </div>
          <ul className="text-sm font-mono space-y-1">
            {files.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm hover:bg-muted">
            <FolderOpen className="w-4 h-4" /> Buka Folder Output
          </button>
          <button
            disabled
            title="Direct print akan masuk fase berikutnya"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm opacity-50 cursor-not-allowed"
          >
            <Printer className="w-4 h-4" /> Kirim ke Printer (Coming soon)
          </button>
          <button
            onClick={() => {
              resetSession();
              navigate({ to: "/admin/session" });
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            <Home className="w-4 h-4" /> Selesai & Reset
          </button>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/customer/welcome"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Atau mulai session baru tanpa reset
          </Link>
        </div>
      </div>
    </div>
  );
}
