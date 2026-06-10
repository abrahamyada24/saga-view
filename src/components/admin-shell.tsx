import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { FolderOpen, Frame, Palette, Play, Settings2, Sliders } from "lucide-react";
import { Marquee, Smiley, Starburst } from "@/components/retro";
import { normalizeDisplayTheme } from "@/lib/display-theme";
import { useStudio } from "@/lib/studio-store";

const navItems = [
  { to: "/admin/session", label: "Session", icon: FolderOpen, num: "01" },
  { to: "/admin/general", label: "General", icon: Sliders, num: "02" },
  { to: "/admin/frames", label: "Frames", icon: Frame, num: "03" },
  { to: "/admin/brand", label: "Brand", icon: Palette, num: "04" },
  { to: "/admin/output", label: "Output", icon: Settings2, num: "05" },
];

export function AdminShell() {
  const preset = normalizeDisplayTheme(useStudio((state) => state.brand.display)).presetId;

  if (preset === "macos") return <MacosAdminShell />;
  if (preset === "brutalism") return <BrutalismAdminShell />;
  if (preset === "bachelor") return <BachelorAdminShell />;
  return <RetroAdminShell />;
}

function useAdminShellData() {
  const { brand, folderName, status } = useStudio();
  const location = useLocation();
  const navigate = useNavigate();
  const current = navItems.find((item) => location.pathname.startsWith(item.to));
  return { brand, current, folderName, location, navigate, status };
}

function RetroAdminShell() {
  const { brand, current, folderName, location, navigate, status } = useAdminShellData();

  return (
    <div className="flex min-h-screen bg-background text-foreground retro-grid-bg">
      <aside className="flex w-64 shrink-0 flex-col border-r-2 border-foreground bg-sidebar text-sidebar-foreground">
        <div className="relative border-b-2 border-foreground px-6 pb-6 pt-7">
          <div className="absolute -right-2 -top-2 text-retro-pink wobble">
            <Smiley size={42} />
          </div>
          <div className="eyebrow">Studio Console</div>
          <div className="font-display mt-2 text-3xl italic leading-tight">{brand.studioName}</div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-5">
          <div className="eyebrow px-2 pb-1">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-xl border-2 border-foreground px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "-rotate-1 bg-sidebar-accent text-sidebar-accent-foreground shadow-[3px_3px_0_0_var(--color-foreground)]"
                    : "bg-card hover:-translate-y-0.5 hover:bg-retro-sky hover:shadow-[3px_3px_0_0_var(--color-foreground)]"
                }`}
              >
                <span className="w-5 font-mono text-[10px] tabular-nums">{item.num}</span>
                <Icon className="h-4 w-4" strokeWidth={2} />
                <span className="font-semibold tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sticker m-4 bg-retro-sun p-4">
          <div className="eyebrow">Current Session</div>
          <div className="mt-2 truncate text-sm font-semibold">
            {folderName ?? "- belum ada folder"}
          </div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-wider">
            {status.replace(/_/g, " ")}
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto">
        <Marquee
          items={[brand.studioName, "Smile - Click - Print", "Retro Photo Booth", "Make it cute"]}
        />
        <AdminHeader current={current} folderName={folderName} navigate={navigate} tone="retro" />
        <div className="max-w-[1400px] px-10 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function MacosAdminShell() {
  const { brand, current, folderName, location, navigate, status } = useAdminShellData();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="relative border-b border-sidebar-border px-6 pb-6 pt-7">
          <div className="absolute right-4 top-4">
            <Starburst size={32} />
          </div>
          <div className="eyebrow">Studio Console</div>
          <div className="font-display mt-2 text-xl font-semibold leading-tight tracking-tight">
            {brand.studioName}
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          <div className="eyebrow px-2 pb-1">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-transparent text-sidebar-foreground/80 hover:border-sidebar-border hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                }`}
              >
                <span className="w-6 font-mono text-[10px] tabular-nums opacity-70">
                  {item.num}
                </span>
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span className="font-medium tracking-wide">{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                )}
              </Link>
            );
          })}
        </nav>
        <MacosSessionCard folderName={folderName} status={status} />
      </aside>
      <main className="flex-1 overflow-auto">
        <Marquee items={[`${brand.studioName} - Studio Console`]} />
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/80 px-8 py-5 backdrop-blur">
          <div className="flex items-center gap-4">
            <Starburst size={44} />
            <div>
              <span className="text-xs text-muted-foreground">{current?.num ?? "00"} - Admin</span>
              <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight">
                {current?.label ?? "Overview"}
              </h1>
            </div>
          </div>
          <MacosStartButton folderName={folderName} navigate={navigate} />
        </header>
        <div className="max-w-[1400px] px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function BrutalismAdminShell() {
  const { brand, current, folderName, location, navigate, status } = useAdminShellData();

  return (
    <div className="flex min-h-screen bg-background text-foreground retro-grid-bg">
      <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="relative border-b border-sidebar-border px-6 pb-6 pt-7">
          <div className="absolute right-4 top-4">
            <Smiley size={36} />
          </div>
          <div className="eyebrow">Studio Console</div>
          <div className="font-display mt-2 text-2xl leading-tight">{brand.studioName}</div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          <div className="eyebrow px-2 pb-1">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-transparent text-sidebar-foreground/80 hover:border-sidebar-border hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                }`}
              >
                <span className="w-6 font-mono text-[10px] tabular-nums opacity-70">
                  {item.num}
                </span>
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span className="font-medium tracking-wide">{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                )}
              </Link>
            );
          })}
        </nav>
        <MacosSessionCard folderName={folderName} status={status} />
      </aside>
      <main className="flex-1 overflow-auto">
        <Marquee
          items={[
            brand.studioName,
            "Modern Brutalism - 2026",
            "Capture - Compose - Export",
            "Frame the moment",
          ]}
        />
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-10 py-6 backdrop-blur">
          <div className="flex items-center gap-5">
            <Starburst size={56} />
            <div>
              <span className="tape">{current?.num ?? "00"} - Admin</span>
              <h1 className="font-display mt-2 text-4xl leading-none">
                {current?.label ?? "Overview"}
              </h1>
            </div>
          </div>
          <button
            onClick={() => navigate({ to: "/customer/welcome" })}
            disabled={!folderName}
            title={folderName ? "Mulai customer flow" : "Pilih folder dulu"}
            className="group inline-flex items-center gap-3 rounded-full border border-primary bg-primary py-2 pl-5 pr-2 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start Customer Flow
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground text-primary transition group-hover:translate-x-0.5">
              <Play className="h-3.5 w-3.5" fill="currentColor" />
            </span>
          </button>
        </header>
        <div className="max-w-[1400px] px-10 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function BachelorAdminShell() {
  const { brand, current, folderName, location, navigate, status } = useAdminShellData();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        <div className="border-b border-sidebar-border px-6 pb-6 pt-7">
          <div className="eyebrow text-sidebar-foreground/60">Studio Console</div>
          <div className="font-display mt-2 text-2xl leading-tight text-sidebar-primary">
            {brand.studioName}
          </div>
        </div>
        <nav className="flex-1 px-3 py-5">
          <div className="eyebrow px-3 pb-2 text-sidebar-foreground/50">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group mb-0.5 flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                }`}
              >
                <span className="w-5 text-[10px] tabular-nums text-sidebar-foreground/40">
                  {item.num}
                </span>
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                <span className="tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border px-6 py-5">
          <div className="eyebrow text-sidebar-foreground/50">Current Session</div>
          <div className="mt-2 truncate text-sm text-sidebar-foreground">
            {folderName ?? "- belum ada folder"}
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-wide text-sidebar-foreground/50">
            {status.replace(/_/g, " ")}
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/60 px-10 py-6 backdrop-blur">
          <div>
            <div className="eyebrow">{current?.num ?? "00"} - Admin</div>
            <h1 className="font-display mt-1 text-3xl leading-none">
              {current?.label ?? "Overview"}
            </h1>
          </div>
          <button
            onClick={() => navigate({ to: "/customer/welcome" })}
            disabled={!folderName}
            title={folderName ? "Mulai customer flow" : "Pilih folder dulu"}
            className="group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-5 pr-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="tracking-wide">Start Customer Flow</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/15 transition group-hover:translate-x-0.5">
              <Play className="h-3.5 w-3.5" fill="currentColor" />
            </span>
          </button>
        </header>
        <div className="max-w-[1400px] px-10 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function AdminHeader({
  current,
  folderName,
  navigate,
  tone,
}: {
  current: (typeof navItems)[number] | undefined;
  folderName: string | null;
  navigate: ReturnType<typeof useNavigate>;
  tone: "retro";
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-foreground bg-card/85 px-10 py-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <span className="inline-block text-retro-pink spin-slow">
          <Starburst size={48} />
        </span>
        <div>
          <span className="tape">{current?.num ?? "00"} - Admin</span>
          <h1 className="font-display mt-2 text-4xl italic leading-none">
            {current?.label ?? "Overview"}
          </h1>
        </div>
      </div>
      <button
        onClick={() => navigate({ to: "/customer/welcome" })}
        disabled={!folderName}
        title={folderName ? "Mulai customer flow" : "Pilih folder dulu"}
        className="group inline-flex items-center gap-3 rounded-full border-2 border-foreground bg-primary py-2 pl-5 pr-2 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-[3px_3px_0_0_var(--color-foreground)] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_0_var(--color-foreground)]"
        data-tone={tone}
      >
        <span>Start Customer Flow</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-retro-sun text-foreground transition group-hover:translate-x-0.5">
          <Play className="h-3.5 w-3.5" fill="currentColor" />
        </span>
      </button>
    </header>
  );
}

function MacosSessionCard({ folderName, status }: { folderName: string | null; status: string }) {
  return (
    <div className="m-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-4">
      <div className="eyebrow">Current Session</div>
      <div className="mt-2 truncate font-mono text-sm">{folderName ?? "- belum ada folder"}</div>
      <div className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
        {status.replace(/_/g, " ")}
      </div>
    </div>
  );
}

function MacosStartButton({
  folderName,
  navigate,
}: {
  folderName: string | null;
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <button
      onClick={() => navigate({ to: "/customer/welcome" })}
      disabled={!folderName}
      title={folderName ? "Mulai customer flow" : "Pilih folder dulu"}
      className="group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-5 pr-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Start Customer Flow
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/15 transition group-hover:translate-x-0.5">
        <Play className="h-3.5 w-3.5" fill="currentColor" />
      </span>
    </button>
  );
}
