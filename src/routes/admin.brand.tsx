import { createFileRoute } from "@tanstack/react-router";
import { type ChangeEvent, type ReactNode } from "react";
import { useStudio, type Brand } from "@/lib/studio-store";
import { RotateCcw, Save, Sparkles, Upload, X } from "lucide-react";
import { useDirtyForm } from "@/lib/use-dirty-form";
import { SaveStatusPill, UnsavedModal } from "@/components/unsaved-modal";
import { toast } from "sonner";
import {
  DISPLAY_THEME_PRESETS,
  type DisplayTheme,
  getDisplayPreset,
  isValidHexColor,
  normalizeDisplayTheme,
} from "@/lib/display-theme";

export const Route = createFileRoute("/admin/brand")({
  component: DisplaySettingsScreen,
});

const HEADING_FONTS = [
  "Playfair Display",
  "Instrument Serif",
  "Inter",
  "DM Serif Display",
  "Archivo Black",
  "Poppins",
  "Georgia",
];
const BODY_FONTS = [
  "Inter",
  "Work Sans",
  "Roboto",
  "Open Sans",
  "Lato",
  "Source Sans 3",
  "JetBrains Mono",
];
const MAX_ASSET_SIZE = 10 * 1024 * 1024;

function DisplaySettingsScreen() {
  const { brand, updateBrand, resetBrand } = useStudio();
  const initial = normalizeBrand(brand);
  const form = useDirtyForm(initial, (v) => {
    updateBrand(v);
    toast.success("Display settings berhasil disimpan");
  });
  const d = normalizeBrand(form.draft);
  const display = normalizeDisplayTheme(d.display);
  const invalidColors = getInvalidColors(display);
  const canSave = invalidColors.length === 0;

  const patchDisplay = (patch: Partial<DisplayTheme>) => {
    const next = { ...display, ...patch };
    form.patch({
      display: next,
      primary: next.primaryButton,
      accent: next.accent,
      headingFont: next.headingFont,
      bodyFont: next.bodyFont,
    });
  };

  const applyPreset = (presetId: DisplayTheme["presetId"]) => {
    const preset = getDisplayPreset(presetId).theme;
    form.patch({
      display: { ...preset },
      primary: preset.primaryButton,
      accent: preset.accent,
      headingFont: preset.headingFont,
      bodyFont: preset.bodyFont,
    });
  };

  const uploadAsset =
    (key: "logo" | "background", allowed: string[]) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      if (file.size > MAX_ASSET_SIZE) {
        toast.error("Ukuran file maksimal 10MB");
        return;
      }
      if (!allowed.includes(file.type)) {
        toast.error("Tipe file belum didukung");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => form.set(key, String(reader.result));
      reader.onerror = () => toast.error("File gagal dibaca");
      reader.readAsDataURL(file);
    };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-6 max-w-7xl pb-24">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Display Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pilih template dulu, lalu ubah warna dan font inti. Layout tetap terkunci supaya flow
              studio tidak berubah.
            </p>
          </div>
          <SaveStatusPill dirty={form.dirty} state={form.saveState} />
        </div>

        <section className="bg-card border border-border rounded-xl p-5 space-y-4">
          <SectionTitle title="Template" subtitle="Preset dari Lovable bisa jadi starting point." />
          <div className="grid grid-cols-2 gap-3">
            {DISPLAY_THEME_PRESETS.map((preset) => (
              <TemplateCard
                key={preset.id}
                preset={preset}
                active={display.presetId === preset.id}
                onApply={() => applyPreset(preset.id)}
              />
            ))}
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-5 space-y-5">
          <SectionTitle
            title="Brand"
            subtitle="Nama, sapaan, logo, dan background customer welcome."
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nama Studio">
              <input
                value={d.studioName}
                onChange={(e) => form.set("studioName", e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              />
            </Field>
            <Field label="Teks Sambutan">
              <input
                value={d.welcome}
                onChange={(e) => form.set("welcome", e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AssetUpload
              label="Logo Studio"
              value={d.logo}
              accept="image/png,image/jpeg,image/svg+xml"
              hint="PNG, JPG, SVG"
              onUpload={uploadAsset("logo", ["image/png", "image/jpeg", "image/svg+xml"])}
              onRemove={() => form.set("logo", null)}
            />
            <AssetUpload
              label="Background Welcome"
              value={d.background}
              accept="image/png,image/jpeg,image/webp"
              hint="PNG, JPG, WEBP"
              onUpload={uploadAsset("background", ["image/png", "image/jpeg", "image/webp"])}
              onRemove={() => form.set("background", null)}
            />
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-5 space-y-5">
          <SectionTitle
            title="Warna"
            subtitle="Kontrol dibuat sedikit, tapi efeknya menyebar ke seluruh app."
          />
          <div className="grid grid-cols-2 gap-4">
            <ColorField
              label="Background"
              value={display.background}
              onChange={(value) => patchDisplay({ background: value })}
            />
            <ColorField
              label="Panel / Card"
              value={display.surface}
              onChange={(value) => patchDisplay({ surface: value })}
            />
            <ColorField
              label="Teks Utama"
              value={display.text}
              onChange={(value) => patchDisplay({ text: value })}
            />
            <ColorField
              label="Teks Secondary"
              value={display.mutedText}
              onChange={(value) => patchDisplay({ mutedText: value })}
            />
            <ColorField
              label="Border"
              value={display.border}
              onChange={(value) => patchDisplay({ border: value })}
            />
            <ColorField
              label="Accent"
              value={display.accent}
              onChange={(value) => patchDisplay({ accent: value })}
            />
            <ColorField
              label="Teks Accent"
              value={display.accentText}
              onChange={(value) => patchDisplay({ accentText: value })}
            />
            <ColorField
              label="Dekorasi / Highlight"
              value={display.decorativeA}
              onChange={(value) => patchDisplay({ decorativeA: value })}
            />
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-5 space-y-5">
          <SectionTitle
            title="Sidebar & Header"
            subtitle="Mengatur warna navigasi admin, step customer, dan status session."
          />
          <div className="grid grid-cols-2 gap-4">
            <ColorField
              label="Sidebar"
              value={display.sidebar}
              onChange={(value) => patchDisplay({ sidebar: value })}
            />
            <ColorField
              label="Teks Sidebar"
              value={display.sidebarText}
              onChange={(value) => patchDisplay({ sidebarText: value })}
            />
            <ColorField
              label="Sidebar Aktif"
              value={display.sidebarAccent}
              onChange={(value) => patchDisplay({ sidebarAccent: value })}
            />
            <ColorField
              label="Teks Sidebar Aktif"
              value={display.sidebarAccentText}
              onChange={(value) => patchDisplay({ sidebarAccentText: value })}
            />
            <ColorField
              label="Border Sidebar"
              value={display.sidebarBorder}
              onChange={(value) => patchDisplay({ sidebarBorder: value })}
            />
            <ColorField
              label="Dekorasi Sekunder"
              value={display.decorativeB}
              onChange={(value) => patchDisplay({ decorativeB: value })}
            />
            <ColorField
              label="Dekorasi Step Aktif"
              value={display.decorativeC}
              onChange={(value) => patchDisplay({ decorativeC: value })}
            />
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-5 space-y-5">
          <SectionTitle
            title="Button & Font"
            subtitle="Cukup atur button utama, button sekunder, font, dan radius."
          />
          <div className="grid grid-cols-2 gap-4">
            <ColorField
              label="Button Utama"
              value={display.primaryButton}
              onChange={(value) => patchDisplay({ primaryButton: value })}
            />
            <ColorField
              label="Teks Button Utama"
              value={display.primaryButtonText}
              onChange={(value) => patchDisplay({ primaryButtonText: value })}
            />
            <ColorField
              label="Button Sekunder"
              value={display.secondaryButton}
              onChange={(value) => patchDisplay({ secondaryButton: value })}
            />
            <ColorField
              label="Teks Button Sekunder"
              value={display.secondaryButtonText}
              onChange={(value) => patchDisplay({ secondaryButtonText: value })}
            />
            <Field label="Heading Font">
              <select
                value={display.headingFont}
                onChange={(e) => patchDisplay({ headingFont: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              >
                {HEADING_FONTS.map((font) => (
                  <option key={font}>{font}</option>
                ))}
              </select>
            </Field>
            <Field label="Body Font">
              <select
                value={display.bodyFont}
                onChange={(e) => patchDisplay({ bodyFont: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              >
                {BODY_FONTS.map((font) => (
                  <option key={font}>{font}</option>
                ))}
              </select>
            </Field>
            <RangeField
              label="Radius Panel"
              value={display.panelRadius}
              min={0}
              max={28}
              onChange={(value) => patchDisplay({ panelRadius: value })}
            />
            <RangeField
              label="Radius Tombol"
              value={display.buttonRadius}
              min={0}
              max={24}
              onChange={(value) => patchDisplay({ buttonRadius: value })}
            />
          </div>
          {invalidColors.length > 0 && (
            <p className="text-xs text-destructive">
              Ada warna belum valid: {invalidColors.join(", ")}. Gunakan format hex seperti #5f7f71.
            </p>
          )}
        </section>

        <div className="flex gap-3 items-center">
          <button
            onClick={form.save}
            disabled={!form.dirty || !canSave}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Simpan Perubahan
          </button>
          <button
            onClick={form.reset}
            disabled={!form.dirty}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm hover:bg-muted disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" /> Reset Perubahan
          </button>
          <button
            onClick={resetBrand}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm hover:bg-muted"
          >
            Reset Default
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Live Preview</div>
        {form.dirty && (
          <div className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--warning)]/15 text-[var(--warning)] font-medium inline-block">
            Preview belum disimpan
          </div>
        )}
        <ThemePreview brand={d} display={display} />
        <p className="text-[11px] text-muted-foreground">
          Yang berubah adalah warna, font, logo, background, dan rasa tombol. Posisi navigasi dan
          flow tetap sama.
        </p>
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

function TemplateCard({
  preset,
  active,
  onApply,
}: {
  preset: (typeof DISPLAY_THEME_PRESETS)[number];
  active: boolean;
  onApply: () => void;
}) {
  const t = preset.theme;
  return (
    <button
      type="button"
      onClick={onApply}
      className={`text-left rounded-xl border p-3 transition ${
        active ? "border-primary ring-2 ring-primary/20" : "border-border hover:bg-muted"
      }`}
      style={{ backgroundColor: t.surface, color: t.text }}
    >
      <div className="flex items-center gap-2 mb-3">
        {[t.background, t.primaryButton, t.secondaryButton, t.accent].map((color) => (
          <span
            key={color}
            className="h-5 w-5 rounded-full border"
            style={{ backgroundColor: color, borderColor: t.border }}
          />
        ))}
      </div>
      <div className="font-semibold text-sm" style={{ fontFamily: t.headingFont }}>
        {preset.name}
      </div>
      <div className="text-xs mt-1 opacity-75">{preset.mood}</div>
      <div className="text-[11px] mt-2 opacity-70">{preset.description}</div>
    </button>
  );
}

function ThemePreview({ brand, display }: { brand: Brand; display: DisplayTheme }) {
  return (
    <div
      className="rounded-xl border overflow-hidden shadow-sm"
      style={{
        backgroundColor: display.background,
        color: display.text,
        borderColor: display.border,
        fontFamily: display.bodyFont,
        borderRadius: display.panelRadius,
      }}
    >
      <div className="grid grid-cols-[92px_1fr] border-b" style={{ borderColor: display.border }}>
        <div
          className="p-3 space-y-2"
          style={{
            backgroundColor: display.sidebar,
            color: display.sidebarText,
            borderRight: `1px solid ${display.sidebarBorder}`,
          }}
        >
          <div className="text-[9px] uppercase tracking-[0.18em] opacity-60">Menu</div>
          {["Session", "Frames", "Brand"].map((item, index) => (
            <div
              key={item}
              className="truncate px-2 py-1.5 text-[10px]"
              style={{
                backgroundColor: index === 2 ? display.sidebarAccent : "transparent",
                color: index === 2 ? display.sidebarAccentText : display.sidebarText,
                borderRadius: Math.max(4, display.panelRadius * 0.7),
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div
          className="min-w-0 p-4"
          style={{
            backgroundColor: display.surface,
            color: display.text,
          }}
        >
          <div
            className="text-[10px] uppercase tracking-[0.16em]"
            style={{ color: display.mutedText }}
          >
            Admin Preview
          </div>
          <div className="mt-1 text-lg font-semibold" style={{ fontFamily: display.headingFont }}>
            Display Settings
          </div>
        </div>
      </div>
      <div
        className="h-24 bg-cover bg-center border-b"
        style={{
          backgroundColor: display.secondaryButton,
          backgroundImage: brand.background ? `url(${brand.background})` : undefined,
          borderColor: display.border,
        }}
      />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="h-12 w-12 rounded-xl border flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: display.primaryButton,
              color: display.primaryButtonText,
              borderColor: display.border,
              borderRadius: display.buttonRadius + 4,
            }}
          >
            {brand.logo ? (
              <img src={brand.logo} alt="" className="h-full w-full object-cover" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-lg font-semibold" style={{ fontFamily: display.headingFont }}>
              {brand.studioName}
            </div>
            <div className="text-xs" style={{ color: display.mutedText }}>
              Display untuk customer flow
            </div>
          </div>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{
            backgroundColor: display.surface,
            borderColor: display.border,
            borderRadius: display.panelRadius,
          }}
        >
          <div className="text-xl font-semibold" style={{ fontFamily: display.headingFont }}>
            {brand.welcome}
          </div>
          <div className="text-sm mt-1" style={{ color: display.mutedText }}>
            Pilih frame favoritmu lalu lanjut ke foto terbaik.
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="px-4 py-2 text-xs font-medium"
              style={{
                backgroundColor: display.primaryButton,
                color: display.primaryButtonText,
                borderRadius: display.buttonRadius,
              }}
            >
              Mulai
            </button>
            <button
              type="button"
              className="px-4 py-2 text-xs font-medium border"
              style={{
                backgroundColor: display.secondaryButton,
                color: display.secondaryButtonText,
                borderColor: display.border,
                borderRadius: display.buttonRadius,
              }}
            >
              Kembali
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] border"
              style={{
                backgroundColor: i === 2 ? display.accent : display.surface,
                borderColor: display.border,
                borderRadius: display.panelRadius * 0.65,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AssetUpload({
  label,
  value,
  accept,
  hint,
  onUpload,
  onRemove,
}: {
  label: string;
  value: string | null;
  accept: string;
  hint: string;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <label className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-3 rounded-md border-2 border-dashed border-border text-xs text-muted-foreground hover:bg-muted cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          {value ? "Ganti file" : `Upload (${hint})`}
          <input type="file" accept={accept} className="hidden" onChange={onUpload} />
        </label>
        {value && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center justify-center w-10 rounded-md border border-border hover:bg-muted"
            title={`Hapus ${label}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">Maksimal 10MB. Tersimpan lokal.</p>
    </Field>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const valid = isValidHexColor(value);
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded border border-border"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 px-3 py-2 rounded-md border bg-background text-sm ${
            valid ? "border-border" : "border-destructive"
          }`}
        />
      </div>
    </Field>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={`${label}: ${value}px`}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </Field>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="font-semibold">{title}</div>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function normalizeBrand(brand: Brand): Brand {
  const display = normalizeDisplayTheme(brand.display);
  return {
    ...brand,
    primary: brand.primary ?? display.primaryButton,
    accent: brand.accent ?? display.accent,
    headingFont: brand.headingFont ?? display.headingFont,
    bodyFont: brand.bodyFont ?? display.bodyFont,
    display,
  };
}

function getInvalidColors(display: DisplayTheme) {
  const labels: [string, string][] = [
    ["Background", display.background],
    ["Panel", display.surface],
    ["Teks", display.text],
    ["Teks secondary", display.mutedText],
    ["Border", display.border],
    ["Accent", display.accent],
    ["Teks accent", display.accentText],
    ["Button utama", display.primaryButton],
    ["Teks button utama", display.primaryButtonText],
    ["Button sekunder", display.secondaryButton],
    ["Teks button sekunder", display.secondaryButtonText],
    ["Sidebar", display.sidebar],
    ["Teks sidebar", display.sidebarText],
    ["Sidebar aktif", display.sidebarAccent],
    ["Teks sidebar aktif", display.sidebarAccentText],
    ["Border sidebar", display.sidebarBorder],
    ["Dekorasi utama", display.decorativeA],
    ["Dekorasi sekunder", display.decorativeB],
    ["Dekorasi step aktif", display.decorativeC],
  ];
  return labels.filter(([, value]) => !isValidHexColor(value)).map(([label]) => label);
}
