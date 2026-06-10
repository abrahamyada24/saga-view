import { AlertTriangle } from "lucide-react";

export function UnsavedModal({
  open,
  onStay,
  onDiscard,
  onSave,
}: {
  open: boolean;
  onStay: () => void;
  onDiscard: () => void;
  onSave: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-6">
      <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--warning)]/15 text-[var(--warning)] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">Perubahan belum disimpan</div>
            <p className="text-sm text-muted-foreground mt-1">
              Kamu punya perubahan yang belum disimpan. Simpan dulu sebelum pindah halaman?
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onSave}
            className="w-full px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            Simpan & Pindah
          </button>
          <button
            onClick={onDiscard}
            className="w-full px-4 py-2.5 rounded-md border border-[var(--warning)]/40 text-[var(--warning)] text-sm font-medium hover:bg-[var(--warning)]/10"
          >
            Pindah Tanpa Simpan
          </button>
          <button
            onClick={onStay}
            className="w-full px-4 py-2.5 rounded-md border border-border text-sm hover:bg-muted"
          >
            Tetap di Halaman Ini
          </button>
        </div>
      </div>
    </div>
  );
}

export function SaveStatusPill({
  dirty,
  state,
}: {
  dirty: boolean;
  state: "idle" | "saving" | "saved" | "error";
}) {
  let label = "";
  let cls = "";
  if (state === "saving") {
    label = "Menyimpan…";
    cls = "bg-muted text-muted-foreground";
  } else if (state === "saved") {
    label = "✓ Tersimpan";
    cls = "bg-[var(--success)]/15 text-[var(--success)]";
  } else if (state === "error") {
    label = "Gagal disimpan. Coba lagi.";
    cls = "bg-destructive/15 text-destructive";
  } else if (dirty) {
    label = "● Belum disimpan";
    cls = "bg-[var(--warning)]/15 text-[var(--warning)]";
  } else {
    label = "✓ Tersimpan";
    cls = "bg-muted text-muted-foreground";
  }
  return <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${cls}`}>{label}</span>;
}
