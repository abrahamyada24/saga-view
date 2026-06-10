import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { FRAMES, useStudio } from "@/lib/studio-store";
import { ArrowRight, Check, Minus, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { BackButton } from "@/components/customer-shell";
import { FrameCanvas } from "@/components/frame-canvas";

export const Route = createFileRoute("/customer/frame")({
  component: FramePicker,
});

function FramePicker() {
  const {
    folderName,
    selectedFrameIds,
    toggleFrame,
    frameQuantities,
    frameMaxQty,
    setFrameQty,
    basicExtraPrice,
    frameOverrides,
    frameCategories,
    customFrames,
  } = useStudio();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("Semua");
  if (!folderName) return <Navigate to="/admin/session" />;
  const categories = ["Semua", ...frameCategories];
  const cat = (f: { id: string; category: string }) => frameOverrides[f.id]?.category ?? f.category;
  const priceOf = (f: { id: string; price: number }) => frameOverrides[f.id]?.price ?? f.price;
  const allFrames = [...customFrames, ...FRAMES];
  const list = allFrames.filter(
    (f) => f.active !== false && (filter === "Semua" || cat(f) === filter),
  );

  const chosen = allFrames.filter((f) => selectedFrameIds.includes(f.id));
  const totalCopies = chosen.reduce((s, f) => s + (frameQuantities[f.id] ?? 1), 0);
  const premiumTotal = chosen.reduce(
    (s, f) => s + (f.premium ? priceOf(f) * (frameQuantities[f.id] ?? 1) : 0),
    0,
  );
  const basicCopies = chosen
    .filter((f) => !f.premium)
    .reduce((s, f) => s + (frameQuantities[f.id] ?? 1), 0);
  const basicExtraCopies = Math.max(0, basicCopies - 1);
  const basicExtraTotal = basicExtraCopies * basicExtraPrice;
  const grandTotal = premiumTotal + basicExtraTotal;

  return (
    <div className="flex-1 px-8 py-6 flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <BackButton to="/customer/welcome" />
          <h1 className="text-2xl font-semibold mt-1">Pilih Frame</h1>
          <p className="text-sm text-muted-foreground">
            Boleh pilih lebih dari satu. Setiap frame akan diisi terpisah.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <div>
              <span className="text-2xl font-semibold text-primary">{totalCopies}</span>
              <span className="text-muted-foreground"> cetakan</span>
            </div>
            <div className="text-xs text-muted-foreground">
              + Rp {grandTotal.toLocaleString("id-ID")}
              {basicExtraCopies > 0 && (
                <span className="ml-1">
                  ({basicExtraCopies}× basic ekstra @Rp{basicExtraPrice.toLocaleString("id-ID")})
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate({ to: "/customer/photos" })}
            disabled={chosen.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            Lanjut ke Pilih Foto
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 shrink-0">
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

      <div className="flex-1 min-h-0 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 py-2 border-b border-border text-xs uppercase tracking-wide text-muted-foreground shrink-0">
          Galeri Frame ({list.length})
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          <div className="grid grid-cols-4 gap-5 content-start pb-2">
            {list.map((f) => {
              const active = selectedFrameIds.includes(f.id);
              const qty = frameQuantities[f.id] ?? 0;
              const max = frameMaxQty[f.id] ?? 5;
              return (
                <div
                  key={f.id}
                  className={`text-left bg-card border-2 rounded-xl overflow-hidden transition-all relative flex flex-col ${
                    active
                      ? "border-primary shadow-lg -translate-y-0.5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  {active && (
                    <div className="absolute top-2 right-2 z-40 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <button
                    onClick={() => toggleFrame(f.id)}
                    className="p-3 bg-muted/40 text-left w-full"
                    aria-label={active ? `Batal pilih ${f.name}` : `Pilih ${f.name}`}
                  >
                    <div className="mx-auto" style={{ maxWidth: 160 }}>
                      <FrameCanvas frame={f} slotMap={[]} size="sm" />
                    </div>
                  </button>
                  <div className="p-3 border-t border-border flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{f.name}</div>
                      {f.premium && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--warning)]/15 text-[var(--warning)] font-medium inline-flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          PREMIUM
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {cat(f)} · {f.slots} slot · max {max}×
                    </div>
                    {f.premium && (
                      <div className="text-xs mt-1 font-medium text-[var(--warning)]">
                        + Rp {priceOf(f).toLocaleString("id-ID")}
                      </div>
                    )}
                    {active && (
                      <div className="mt-3 flex items-center justify-between rounded-md border border-border px-1.5 py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (qty <= 1) toggleFrame(f.id);
                            else setFrameQty(f.id, qty - 1);
                          }}
                          aria-label="Kurangi jumlah"
                          className="w-7 h-7 rounded-md hover:bg-muted inline-flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="text-sm font-semibold">{qty}×</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFrameQty(f.id, qty + 1);
                          }}
                          disabled={qty >= max}
                          aria-label="Tambah jumlah"
                          className="w-7 h-7 rounded-md hover:bg-muted inline-flex items-center justify-center disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {basicExtraCopies > 0 && (
        <p className="text-[11px] text-muted-foreground mt-3">
          Frame Basic pertama gratis. Cetakan tambahan dikenakan Rp{" "}
          {basicExtraPrice.toLocaleString("id-ID")} per cetakan.
        </p>
      )}
    </div>
  );
}
