import { createFileRoute } from "@tanstack/react-router";
import { type TimerOnExpire, useStudio } from "@/lib/studio-store";
import {
  Plus,
  Trash2,
  Clock,
  Settings2,
  ShieldCheck,
  Workflow,
  Save,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { useDirtyForm } from "@/lib/use-dirty-form";
import { SaveStatusPill, UnsavedModal } from "@/components/unsaved-modal";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/general")({
  component: GeneralSettings,
});

const TIMER_EXPIRE_OPTIONS: { v: TimerOnExpire; l: string }[] = [
  { v: "add_time", l: "Tambah waktu" },
  { v: "call_admin", l: "Panggil admin" },
  { v: "continue", l: "Lanjut tanpa timer" },
];

function GeneralSettings() {
  const store = useStudio();
  const [newCat, setNewCat] = useState("");

  const form = useDirtyForm(
    {
      photoTimerSec: store.photoTimerSec,
      editorTimerSec: store.editorTimerSec,
      basicExtraPrice: store.basicExtraPrice,
      basicExtraEnabled: store.basicExtraEnabled,
      workflow: store.workflow,
      privacy: store.privacy,
      timerOnExpire: store.timerOnExpire,
      frameCategories: store.frameCategories,
    },
    (v) => {
      store.setPhotoTimer(v.photoTimerSec);
      store.setEditorTimer(v.editorTimerSec);
      store.setBasicExtraPrice(v.basicExtraPrice);
      store.setBasicExtraEnabled(v.basicExtraEnabled);
      store.setWorkflow(v.workflow);
      store.setPrivacy(v.privacy);
      store.setTimerOnExpire(v.timerOnExpire);
      // sync categories
      const defaults = ["Basic", "Tema", "Premium"];
      const cur = useStudio.getState().frameCategories;
      cur.forEach((c) => {
        if (!v.frameCategories.includes(c) && !defaults.includes(c)) store.removeFrameCategory(c);
      });
      v.frameCategories.forEach((c) => {
        if (!cur.includes(c)) store.addFrameCategory(c);
      });
      toast.success("Pengaturan berhasil disimpan");
    },
  );
  const d = form.draft;

  const saveAndToast = () => form.save();

  return (
    <div className="space-y-6 max-w-3xl pb-24">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">General Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pengaturan operasional studio. Harga per-frame & kategori per-frame diatur di Frame
            Manager.
          </p>
        </div>
        <SaveStatusPill dirty={form.dirty} state={form.saveState} />
      </div>

      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-primary" />
          <div className="font-semibold">Workflow Defaults</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Default Target Foto">
            <input
              type="number"
              min={1}
              max={30}
              value={d.workflow.defaultTargetPhotos}
              onChange={(e) =>
                form.patch({
                  workflow: {
                    ...d.workflow,
                    defaultTargetPhotos: Math.max(1, Number(e.target.value) || 10),
                  },
                })
              }
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            />
          </Field>
          <Field label="Default Output Mode">
            <div className="px-3 py-2 rounded-md border border-border bg-muted/30 text-sm">
              Simpan PNG ke folder
            </div>
          </Field>
        </div>
        <Toggle
          label="Auto Isi default di Editor"
          value={d.workflow.autoFillDefault}
          onChange={(v) => form.patch({ workflow: { ...d.workflow, autoFillDefault: v } })}
        />
        <Toggle
          label="Wajib review sebelum export"
          value={d.workflow.requireReviewBeforeExport}
          onChange={(v) =>
            form.patch({ workflow: { ...d.workflow, requireReviewBeforeExport: v } })
          }
        />
        <Toggle
          label="Wajib konfirmasi pembayaran untuk premium"
          value={d.workflow.requirePaymentForPremium}
          onChange={(v) => form.patch({ workflow: { ...d.workflow, requirePaymentForPremium: v } })}
        />
      </section>

      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <div className="font-semibold">Session Rules</div>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">Set 0 untuk menonaktifkan timer.</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Timer Pilih Foto (detik)">
            <input
              type="number"
              min={0}
              value={d.photoTimerSec}
              onChange={(e) => form.set("photoTimerSec", Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              {d.photoTimerSec > 0 ? fmt(d.photoTimerSec) : "Nonaktif"}
            </p>
          </Field>
          <Field label="Timer Editor Foto (detik)">
            <input
              type="number"
              min={0}
              value={d.editorTimerSec}
              onChange={(e) => form.set("editorTimerSec", Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              {d.editorTimerSec > 0 ? fmt(d.editorTimerSec) : "Nonaktif"}
            </p>
          </Field>
        </div>
        <Field label="Saat timer habis">
          <div className="flex gap-2 flex-wrap">
            {TIMER_EXPIRE_OPTIONS.map((o) => (
              <button
                key={o.v}
                onClick={() => form.set("timerOnExpire", o.v)}
                className={`px-3 py-1.5 rounded-md text-xs border ${
                  d.timerOnExpire === o.v
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </Field>
      </section>

      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <div className="font-semibold">Pricing Rules</div>
        </div>
        <Toggle
          label="Aktifkan biaya extra basic"
          value={d.basicExtraEnabled}
          onChange={(v) => form.set("basicExtraEnabled", v)}
        />
        <Field label="Biaya ekstra per cetakan basic (Rp)">
          <input
            type="number"
            min={0}
            step={1000}
            value={d.basicExtraPrice}
            disabled={!d.basicExtraEnabled}
            onChange={(e) => form.set("basicExtraPrice", Number(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm disabled:opacity-50"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Cetakan basic pertama gratis. Cetakan berikutnya mengikuti biaya ini.
          </p>
        </Field>
      </section>

      <section className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="font-semibold">Frame Categories</div>
        <p className="text-xs text-muted-foreground -mt-2">
          Kategori default (Basic, Tema, Premium) tidak bisa dihapus. Tambah kategori baru untuk
          dipakai di Frame Manager.
        </p>
        <div className="flex flex-wrap gap-2">
          {d.frameCategories.map((c) => {
            const isDefault = ["Basic", "Tema", "Premium"].includes(c);
            return (
              <div
                key={c}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs bg-muted/40"
              >
                <span>{c}</span>
                {!isDefault && (
                  <button
                    onClick={() =>
                      form.patch({
                        frameCategories: d.frameCategories.filter((x) => x !== c),
                      })
                    }
                    aria-label={`Hapus kategori ${c}`}
                    title={`Hapus kategori ${c}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 pt-2">
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Nama kategori baru"
            className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
          />
          <button
            onClick={() => {
              const v = newCat.trim();
              if (!v) return;
              if (d.frameCategories.includes(v)) {
                setNewCat("");
                return;
              }
              form.patch({ frameCategories: [...d.frameCategories, v] });
              setNewCat("");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground italic">
          Kategori baru aktif setelah klik "Simpan Perubahan".
        </p>
      </section>

      <section className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <div className="font-semibold">Security & Privacy</div>
        </div>
        <Toggle
          label="Auto clear session cache setelah export"
          value={d.privacy.autoClearAfterExport}
          onChange={(v) => form.patch({ privacy: { ...d.privacy, autoClearAfterExport: v } })}
        />
        <Field label="Retention reminder">
          <div className="flex gap-2">
            {[
              { v: 1, l: "1 hari" },
              { v: 7, l: "7 hari" },
              { v: 0, l: "Manual" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() =>
                  form.patch({ privacy: { ...d.privacy, retentionDays: o.v as 0 | 1 | 7 } })
                }
                className={`px-3 py-1.5 rounded-md text-xs border ${
                  d.privacy.retentionDays === o.v
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </Field>
        <Toggle
          label="Sembunyikan path file dari layar customer"
          value={d.privacy.hideFilePathFromCustomer}
          onChange={(v) => form.patch({ privacy: { ...d.privacy, hideFilePathFromCustomer: v } })}
        />
        <Toggle
          label="Wajib mode admin untuk konfirmasi pembayaran"
          value={d.privacy.requireAdminForPayment}
          onChange={(v) => form.patch({ privacy: { ...d.privacy, requireAdminForPayment: v } })}
        />
        <Toggle
          label="Blok customer mengakses route admin"
          value={d.privacy.blockCustomerAdminRoutes}
          onChange={(v) => form.patch({ privacy: { ...d.privacy, blockCustomerAdminRoutes: v } })}
        />
      </section>

      <div className="sticky bottom-0 -mx-8 px-8 py-3 bg-background/95 backdrop-blur border-t border-border flex items-center justify-between">
        <SaveStatusPill dirty={form.dirty} state={form.saveState} />
        <div className="flex gap-2">
          <button
            onClick={form.reset}
            disabled={!form.dirty}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm hover:bg-muted disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" /> Reset Perubahan
          </button>
          <button
            onClick={form.save}
            disabled={!form.dirty}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Simpan Perubahan
          </button>
        </div>
      </div>

      <UnsavedModal
        open={form.blocked}
        onStay={form.stay}
        onDiscard={form.discardAndGo}
        onSave={form.saveAndGo}
      />
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-pressed={value}
        aria-label={`${value ? "Nonaktifkan" : "Aktifkan"} ${label}`}
        title={`${value ? "Nonaktifkan" : "Aktifkan"} ${label}`}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          value ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
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

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s} detik`;
  return s === 0 ? `${m} menit` : `${m}m ${s}s`;
}
