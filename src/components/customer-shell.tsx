import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, X } from "lucide-react";
import { Marquee, Smiley } from "@/components/retro";
import { normalizeDisplayTheme } from "@/lib/display-theme";
import { useStudio } from "@/lib/studio-store";

const STEPS = [
  { path: "/customer/welcome", label: "Welcome", num: "01" },
  { path: "/customer/frame", label: "Frame", num: "02" },
  { path: "/customer/photos", label: "Photos", num: "03" },
  { path: "/customer/editor", label: "Editor", num: "04" },
  { path: "/customer/review", label: "Review", num: "05" },
  { path: "/customer/finish", label: "Finish", num: "06" },
];

export function CustomerShell() {
  const preset = normalizeDisplayTheme(useStudio((state) => state.brand.display)).presetId;

  if (preset === "macos") return <MacosCustomerShell />;
  if (preset === "brutalism") return <BrutalismCustomerShell />;
  if (preset === "bachelor") return <BachelorCustomerShell />;
  return <RetroCustomerShell />;
}

function useCustomerShellData() {
  const location = useLocation();
  const navigate = useNavigate();
  const { brand } = useStudio();
  const currentIdx = STEPS.findIndex((step) => step.path === location.pathname);
  return { brand, currentIdx, navigate };
}

function RetroCustomerShell() {
  const { brand, currentIdx, navigate } = useCustomerShellData();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background retro-grid-bg">
      <Marquee
        items={[
          "Say cheese",
          "Smile - Click - Print",
          brand.studioName,
          "Pick a frame",
          "Make it cute",
        ]}
      />
      <header className="border-b-2 border-foreground bg-card">
        <div className="flex items-center gap-5 px-5 py-3 md:px-8">
          <div className="flex min-w-[240px] items-center gap-3">
            <span className="shrink-0 text-retro-sun wobble">
              <Smiley size={34} />
            </span>
            <div className="truncate font-display text-[26px] italic leading-none">
              {brand.studioName}
            </div>
          </div>
          <Stepper currentIdx={currentIdx} tone="retro" />
          <ExitButton navigate={navigate} tone="retro" />
        </div>
      </header>
      <CustomerMain />
    </div>
  );
}

function MacosCustomerShell() {
  const { brand, currentIdx, navigate } = useCustomerShellData();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Marquee items={[`${brand.studioName} - Customer Flow`]} />
      <header className="border-b border-border bg-card/70 backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-6 pb-3 pt-5 md:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <span className="truncate font-display text-xl font-semibold tracking-tight">
              {brand.studioName}
            </span>
          </div>
          <ExitButton navigate={navigate} tone="macos" />
        </div>
        <div className="overflow-x-auto px-6 pb-4 md:px-10">
          <Stepper currentIdx={currentIdx} tone="macos" />
        </div>
      </header>
      <CustomerMain />
    </div>
  );
}

function BrutalismCustomerShell() {
  const { brand, currentIdx, navigate } = useCustomerShellData();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background retro-grid-bg">
      <Marquee
        items={[
          "Capture the moment",
          "Modern Brutalism - 2026",
          brand.studioName,
          "Pick a frame",
          "Frame it loud",
        ]}
      />
      <header className="border-b border-border bg-background">
        <div className="flex items-center justify-between gap-4 px-6 pb-3 pt-5 md:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Smiley size={32} />
            <div className="truncate font-display text-2xl leading-none">{brand.studioName}</div>
          </div>
          <ExitButton navigate={navigate} tone="brutalism" />
        </div>
        <div className="overflow-x-auto px-6 pb-4 md:px-10">
          <Stepper currentIdx={currentIdx} tone="brutalism" />
        </div>
      </header>
      <CustomerMain />
    </div>
  );
}

function BachelorCustomerShell() {
  const { brand, currentIdx, navigate } = useCustomerShellData();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between gap-4 px-6 pb-3 pt-5 md:px-10">
          <div className="truncate font-display text-xl leading-none">{brand.studioName}</div>
          <ExitButton navigate={navigate} tone="bachelor" />
        </div>
        <div className="overflow-x-auto px-6 pb-4 md:px-10">
          <Stepper currentIdx={currentIdx} tone="bachelor" />
        </div>
      </header>
      <CustomerMain />
    </div>
  );
}

function CustomerMain() {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-auto">
      <Outlet />
    </main>
  );
}

function Stepper({
  currentIdx,
  tone,
}: {
  currentIdx: number;
  tone: "retro" | "macos" | "brutalism" | "bachelor";
}) {
  if (tone === "bachelor") {
    return (
      <ol className="flex min-w-max items-center gap-0">
        {STEPS.map((step, index) => {
          const active = index === currentIdx;
          const done = currentIdx > -1 && index < currentIdx;
          return (
            <li key={step.path} className="flex shrink-0 items-center">
              <div
                className={`flex items-center gap-2 py-1 transition ${
                  active
                    ? "text-foreground"
                    : done
                      ? "text-foreground/70"
                      : "text-muted-foreground/60"
                }`}
              >
                <span className="w-5 text-right text-[10px] tabular-nums tracking-widest">
                  {step.num}
                </span>
                <span
                  className={`text-[11px] uppercase tracking-[0.16em] ${
                    active ? "font-medium" : ""
                  }`}
                >
                  {step.label}
                </span>
                {active && (
                  <span aria-hidden className="ml-1 h-1.5 w-1.5 rounded-full bg-foreground" />
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-3 h-px w-8 md:w-12 ${done ? "bg-foreground/40" : "bg-border"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="flex min-w-max items-center gap-0">
      {STEPS.map((step, index) => {
        const active = index === currentIdx;
        const done = currentIdx > -1 && index < currentIdx;
        const retroBg = active ? "bg-retro-sun" : done ? "bg-retro-mint" : "bg-card";
        return (
          <li key={step.path} className="flex shrink-0 items-center">
            <div
              className={`flex items-center gap-2 rounded-full transition ${
                tone === "retro"
                  ? `border-2 border-foreground px-3 py-1.5 ${retroBg} ${
                      active ? "-rotate-1 shadow-[3px_3px_0_0_var(--color-foreground)]" : ""
                    }`
                  : `border px-3 py-1.5 ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : done
                          ? "border-border text-foreground"
                          : "border-border text-muted-foreground"
                    }`
              }`}
            >
              <span
                className={`text-[10px] tabular-nums tracking-widest ${
                  tone === "brutalism" || tone === "retro" ? "font-mono font-bold" : "font-mono"
                }`}
              >
                {step.num}
              </span>
              <span
                className={`text-[11px] uppercase ${
                  tone === "brutalism" || tone === "retro"
                    ? "font-bold tracking-[0.18em]"
                    : "font-medium tracking-tight"
                } ${tone === "retro" && !active && !done ? "text-muted-foreground" : ""}`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-2 h-px w-6 md:w-10 ${
                  done ? (tone === "retro" ? "bg-foreground" : "bg-primary") : "bg-border"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ExitButton({
  navigate,
  tone,
}: {
  navigate: ReturnType<typeof useNavigate>;
  tone: "retro" | "macos" | "brutalism" | "bachelor";
}) {
  const className =
    tone === "retro"
      ? "inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-retro-pink px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--color-foreground)]"
      : tone === "brutalism"
        ? "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] transition hover:border-primary hover:text-primary"
        : tone === "bachelor"
          ? "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition hover:text-foreground"
          : "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground";

  return (
    <button onClick={() => navigate({ to: "/admin/session" })} className={`shrink-0 ${className}`}>
      <X className="h-3 w-3" />
      Exit
    </button>
  );
}

export function BackButton({ to }: { to: string }) {
  const preset = normalizeDisplayTheme(useStudio((state) => state.brand.display)).presetId;
  const tone =
    preset === "macos" || preset === "brutalism" || preset === "bachelor" ? preset : "retro";

  const className =
    tone === "retro"
      ? "inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-card px-3 py-1.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--color-foreground)]"
      : tone === "brutalism"
        ? "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-semibold transition hover:border-primary hover:text-primary"
        : tone === "bachelor"
          ? "inline-flex items-center gap-1.5 px-0 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          : "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-muted";

  return (
    <Link to={to} className={className}>
      <ArrowLeft className="h-4 w-4" /> Kembali
    </Link>
  );
}
