import { createFileRoute } from "@tanstack/react-router";
import { useStudio } from "@/lib/studio-store";
import { FolderOpen, Info, Save, RotateCcw } from "lucide-react";
import { useDirtyForm } from "@/lib/use-dirty-form";
import { SaveStatusPill, UnsavedModal } from "@/components/unsaved-modal";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/output")({
  component: OutputScreen,
});

type DirectoryHandle = {
  name: string;
};

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<DirectoryHandle>;
};

function OutputScreen() {
  const store = useStudio();
  const form = useDirtyForm(
    {
      outputFolder: store.outputFolder,
      resolution: store.resolution,
      dpi: store.dpi,
      filenamePattern: store.filenamePattern,
    },
    (v) => {
      store.setOutput({ outputFolder: v.outputFolder, resolution: v.resolution, dpi: v.dpi });
      store.setFilenamePattern(v.filenamePattern);
      toast.success("Output settings berhasil disimpan");
    },
  );
  const d = form.draft;
  const pickOutputFolder = async () => {
    const picker = (window as DirectoryPickerWindow).showDirectoryPicker;
    if (!picker) {
      toast.error(
        "Browser ini belum mendukung pilih folder output langsung. Export akan berupa download PNG.",
      );
      return;
    }
    try {
      const handle = await picker({ mode: "readwrite" });
      store.setOutputDirectoryHandle(handle, handle.name);
      form.set("outputFolder", handle.name);
      toast.success(`Folder output dipilih: ${handle.name}`);
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        toast.error("Gagal memilih folder output");
      }
    }
  };
  const preview = (name: string, frameName: string, i: number) =>
    d.filenamePattern
      .replace("{sessionName}", name)
      .replace("{frameName}", frameName)
      .replace("{index}", String(i).padStart(2, "0"));
  return (
    <div className="max-w-3xl space-y-6 pb-24">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Output Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            MVP fokus PNG. Direct print menyusul di fase berikutnya.
          </p>
        </div>
        <SaveStatusPill dirty={form.dirty} state={form.saveState} />
      </div>
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
            Folder Output
          </div>
          <div className="flex gap-2">
            <input
              value={d.outputFolder}
              onChange={(e) => form.set("outputFolder", e.target.value)}
              className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
            />
            <button
              type="button"
              onClick={pickOutputFolder}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm hover:bg-muted"
            >
              <FolderOpen className="w-4 h-4" /> Pilih
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
              Format
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-md border border-primary bg-primary/10 text-primary text-sm">
                PNG
              </button>
              <button
                disabled
                title="Fase berikutnya"
                className="px-4 py-2 rounded-md border border-border text-sm opacity-50 cursor-not-allowed"
              >
                JPG
              </button>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">DPI</div>
            <input
              type="number"
              value={d.dpi}
              onChange={(e) => form.set("dpi", Number(e.target.value) || 300)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
              Canvas Preset
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["4R", "Postcard", "Square"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => form.set("resolution", r)}
                  className={`px-3 py-2 rounded-md border text-xs ${
                    d.resolution === r
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
            Filename Pattern
          </div>
          <input
            value={d.filenamePattern}
            onChange={(e) => form.set("filenamePattern", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-mono"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Token: {"{sessionName}"}, {"{frameName}"}, {"{index}"}.
          </p>
          <div className="mt-2 rounded-md border border-border bg-muted/30 p-2 space-y-0.5 text-[11px] font-mono">
            <div>{preview("Alya-Rafi", "Filmstrip-Airmail", 1)}</div>
            <div>{preview("Alya-Rafi", "Vintage-Gold", 2)}</div>
          </div>
        </div>
      </div>
      <div className="bg-muted/40 border border-border rounded-xl p-4 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        Direct print ke printer akan masuk fase berikutnya. Saat ini hasil disimpan sebagai PNG ke
        folder output.
      </div>
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
