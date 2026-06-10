import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { FRAMES, useStudio } from "@/lib/studio-store";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CreditCard,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";
import { BackButton } from "@/components/customer-shell";
import { FrameCanvas } from "@/components/frame-canvas";
import { useState } from "react";
import { exportFramePngs } from "@/lib/export-png";
import { toast } from "sonner";

export const Route = createFileRoute("/customer/review")({
  component: Review,
});

function Review() {
  const {
    folderName,
    selectedFrameIds,
    slotMaps,
    paymentPaid,
    payPremium,
    adminMode,
    toggleAdminMode,
    exportPng,
    frameQuantities,
    basicExtraPrice,
    frameOverrides,
    outputFolder,
    outputDirectoryHandle,
    filenamePattern,
    privacy,
    customFrames,
    sessionPhotos,
  } = useStudio();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [idx, setIdx] = useState(0);

  if (!folderName) return <Navigate to="/admin/session" />;
  if (sessionPhotos.length === 0) return <Navigate to="/admin/session" />;
  if (selectedFrameIds.length === 0) return <Navigate to="/customer/frame" />;

  const allFrames = [...customFrames, ...FRAMES];
  const baseFrames = allFrames.filter((f) => selectedFrameIds.includes(f.id));
  const premiumFrames = baseFrames.filter((f) => f.premium);
  const freeFrames = baseFrames.filter((f) => !f.premium);
  const qty = (id: string) => frameQuantities[id] ?? 1;
  // Build instance list to display each copy
  const frames: { frame: (typeof baseFrames)[number]; key: string; copy: number; total: number }[] =
    [];
  baseFrames.forEach((f) => {
    const q = Math.max(1, qty(f.id));
    for (let i = 1; i <= q; i++) {
      frames.push({ frame: f, key: `${f.id}#${i}`, copy: i, total: q });
    }
  });
  const priceOf = (f: { id: string; price: number }) => frameOverrides[f.id]?.price ?? f.price;
  const premiumTotal = premiumFrames.reduce((s, f) => s + priceOf(f) * qty(f.id), 0);
  const basicCopies = freeFrames.reduce((s, f) => s + qty(f.id), 0);
  const basicExtraCopies = Math.max(0, basicCopies - 1);
  const basicExtraTotal = basicExtraCopies * basicExtraPrice;
  const grandTotal = premiumTotal + basicExtraTotal;
  const needsPay = grandTotal > 0 && !paymentPaid;

  const allFilled = frames.every(({ frame, key }) => {
    const sm = slotMaps[key] ?? [];
    return sm.filter(Boolean).length === frame.slots;
  });
  const photoIds = new Set(sessionPhotos.map((photo) => photo.id));
  const allMappedPhotosExist = frames.every(({ key }) =>
    (slotMaps[key] ?? []).every((photoId) => !photoId || photoIds.has(photoId)),
  );
  const filenameValid = /\{sessionName\}|\{frameName\}|\{index\}/.test(filenamePattern);
  const folderReady = (outputFolder ?? "").trim().length > 0;
  const checklist = [
    { label: "Semua frame sudah diisi", ok: allFilled },
    { label: "Semua foto berasal dari folder lokal aktif", ok: allMappedPhotosExist },
    { label: "Pembayaran premium siap", ok: !needsPay },
    { label: "Folder output siap", ok: folderReady },
    { label: "Pola nama file valid", ok: filenameValid },
    { label: "Format PNG", ok: true },
  ];
  const exportBlocked = checklist.some((c) => !c.ok);

  const safeIdx = Math.min(idx, Math.max(0, frames.length - 1));
  const current = frames[safeIdx];
  const prev = () => setIdx((i) => (i - 1 + frames.length) % frames.length);
  const next = () => setIdx((i) => (i + 1) % frames.length);

  return (
    <div className="flex-1 px-8 py-6 grid grid-cols-[1fr_360px] gap-6 min-h-0 overflow-hidden">
      <div className="flex flex-col min-h-0">
        <BackButton to="/customer/editor" />
        <h1 className="text-2xl font-semibold mt-1 mb-4">Review Hasil Akhir</h1>
        <div className="flex-1 bg-card border border-border rounded-xl p-6 min-h-0 flex flex-col">
          {current && (
            <>
              <div className="flex-1 min-h-0 flex items-center justify-center gap-4">
                <button
                  onClick={prev}
                  disabled={frames.length < 2}
                  aria-label="Frame sebelumnya"
                  className="shrink-0 w-10 h-10 rounded-full border border-border bg-background hover:bg-muted flex items-center justify-center disabled:opacity-40"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 h-full min-h-0 flex items-center justify-center">
                  <div className="h-full max-h-full" style={{ aspectRatio: "3 / 4" }}>
                    <FrameCanvas
                      frame={current.frame}
                      slotMap={slotMaps[current.key] ?? []}
                      instanceKey={current.key}
                    />
                  </div>
                </div>
                <button
                  onClick={next}
                  disabled={frames.length < 2}
                  aria-label="Frame berikutnya"
                  className="shrink-0 w-10 h-10 rounded-full border border-border bg-background hover:bg-muted flex items-center justify-center disabled:opacity-40"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">
                    {current.frame.name}
                    {current.total > 1 && (
                      <span className="text-muted-foreground"> ({current.copy})</span>
                    )}
                  </div>
                  {current.frame.premium && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--warning)]/15 text-[var(--warning)] font-medium">
                      PREMIUM
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {safeIdx + 1} / {frames.length}
                </div>
              </div>
              {frames.length > 1 && (
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  {frames.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      aria-label={`Lihat frame ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        i === safeIdx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <aside className="space-y-4 overflow-y-auto min-h-0 pr-1">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Ringkasan</div>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Basic ({basicCopies}×)</span>
              <span>
                {basicExtraCopies > 0
                  ? `+ Rp ${basicExtraTotal.toLocaleString("id-ID")}`
                  : "Gratis"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Premium ({premiumFrames.reduce((s, f) => s + qty(f.id), 0)}×)
              </span>
              <span>+ Rp {premiumTotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-border mt-2">
              <span>Total</span>
              <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
            </div>
            {basicExtraCopies > 0 && (
              <p className="text-[10px] text-muted-foreground pt-1">
                Basic ekstra: Rp {basicExtraPrice.toLocaleString("id-ID")} × {basicExtraCopies}
              </p>
            )}
          </div>
        </div>

        {grandTotal > 0 && (
          <div
            className={`rounded-xl p-5 border-2 ${
              paymentPaid
                ? "border-[var(--success)]/40 bg-[var(--success)]/10"
                : "border-dashed border-[var(--warning)]/60 bg-[var(--warning)]/5"
            }`}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin Action · Hanya admin
            </div>
            <div className="flex items-center gap-2 text-sm font-medium mt-2">
              <Sparkles className="w-4 h-4" />
              Payment Hold
            </div>
            <div className="text-2xl font-semibold mt-1">
              Rp {grandTotal.toLocaleString("id-ID")}
            </div>
            {paymentPaid ? (
              <div className="text-xs text-[var(--success)] mt-1">
                ✓ Pembayaran dikonfirmasi oleh admin
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mt-1">
                  Customer wajib bayar ke admin. Export PNG dikunci sampai admin konfirmasi.
                </p>
                {!adminMode ? (
                  <>
                    <div className="mt-2 text-xs font-medium">
                      Payment Hold · panggil admin untuk konfirmasi
                    </div>
                    <button
                      onClick={toggleAdminMode}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-[var(--warning)]/40 text-[var(--warning)] text-xs font-medium hover:bg-[var(--warning)]/10"
                    >
                      Aktifkan Mode Admin
                    </button>
                    <p className="mt-2 text-[10px] text-muted-foreground italic">
                      Simulasi prototype. Di produksi bisa memakai PIN/staff login.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-wide">
                      Staff Confirmation
                    </div>
                    <button
                      onClick={payPremium}
                      className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium"
                      style={{ backgroundColor: "var(--warning)", color: "white" }}
                    >
                      <CreditCard className="w-4 h-4" />
                      Tandai Pembayaran Lunas
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        <button
          onClick={async () => {
            setExporting(true);
            try {
              const result = await exportFramePngs({
                frames,
                slotMaps,
                photos: sessionPhotos,
                rotations: useStudio.getState().rotations,
                slotTransforms: useStudio.getState().slotTransforms,
                sessionName: useStudio.getState().sessionName || "Customer-001",
                filenamePattern,
                outputDirectoryHandle,
              });
              exportPng(result.files, result.saveMode);
              toast.success(
                result.saveMode === "folder"
                  ? `${result.files.length} PNG tersimpan ke folder output`
                  : `${result.files.length} PNG dibuat sebagai download`,
              );
              navigate({ to: "/customer/finish" });
            } catch (error) {
              console.error(error);
              toast.error("Export PNG gagal. Cek frame/foto lalu coba lagi.");
            } finally {
              setExporting(false);
            }
          }}
          disabled={exportBlocked || exporting}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
        >
          {exporting ? "Membuat PNG..." : "Export PNG Sekarang"} <ArrowRight className="w-4 h-4" />
        </button>
        <div className="bg-card border border-border rounded-xl p-4 space-y-1.5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Export Checklist
          </div>
          {checklist.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-xs">
              {c.ok ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)] shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
              )}
              <span className={c.ok ? "text-muted-foreground" : "text-foreground font-medium"}>
                {c.label}
              </span>
            </div>
          ))}
          {(!privacy.hideFilePathFromCustomer || useStudio.getState().adminMode) && (
            <div className="pt-2 text-[10px] text-muted-foreground font-mono truncate">
              {outputFolder}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
