import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight, FolderOpen } from "lucide-react";
import { Smiley, Starburst, Wave } from "@/components/retro";
import { normalizeDisplayTheme } from "@/lib/display-theme";
import { useStudio } from "@/lib/studio-store";

export const Route = createFileRoute("/customer/welcome")({
  component: Welcome,
});

function Welcome() {
  const preset = normalizeDisplayTheme(useStudio((state) => state.brand.display)).presetId;

  if (preset === "macos") return <MacosWelcome />;
  if (preset === "brutalism") return <BrutalismWelcome />;
  if (preset === "bachelor") return <BachelorWelcome />;
  return <RetroWelcome />;
}

function useWelcomeData() {
  const { adminMode, brand, folderName, photoCount, privacy, sessionName } = useStudio();
  const showPath = !privacy.hideFilePathFromCustomer || adminMode;
  const ready = Boolean(folderName);
  return { brand, folderName, photoCount, ready, sessionName, showPath };
}

function RetroWelcome() {
  const { brand, folderName, photoCount, ready, sessionName, showPath } = useWelcomeData();

  return (
    <WelcomeCanvas className="relative flex flex-1 items-center justify-center px-6 py-12 md:px-10">
      <span className="absolute right-16 top-10 hidden text-retro-pink spin-slow md:block">
        <Starburst size={72} />
      </span>
      <span className="absolute bottom-16 left-12 hidden text-retro-sun wobble md:block">
        <Smiley size={64} />
      </span>
      <span className="absolute left-24 top-24 hidden text-retro-sky md:block">
        <Smiley size={42} />
      </span>

      <div className="relative grid w-full max-w-4xl grid-cols-1 items-center gap-10 md:grid-cols-[1.3fr_1fr] md:gap-14">
        <div>
          <span className="tape">{ready ? "Sesi siap" : "Menunggu sesi"}</span>
          <h1 className="font-display mt-4 text-5xl leading-[1.02] md:text-7xl">
            Hai, selamat datang di{" "}
            <span className="relative inline-block italic">
              {brand.studioName}.
              <Wave className="absolute -bottom-2 left-0 h-3 w-full text-retro-pink" />
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/80 md:text-lg">
            {brand.welcome}
          </p>
          <WelcomeCta ready={ready} tone="retro" />
        </div>

        <aside className="relative">
          <div className="sticker sticker-hover relative rotate-2 bg-retro-cream p-6">
            <span className="tape absolute -left-3 -top-3">Detail Sesi</span>
            <span className="absolute -right-4 -top-4 text-retro-pink">
              <Smiley size={36} />
            </span>
            <SessionDefinitionList
              folderName={folderName}
              photoCount={photoCount}
              ready={ready}
              sessionName={sessionName}
              showPath={showPath}
              tone="retro"
            />
          </div>
          <div aria-hidden className="sticker absolute inset-0 -z-10 -rotate-3 bg-retro-sky" />
          <div
            aria-hidden
            className="sticker absolute inset-0 -z-20 translate-x-5 translate-y-5 rotate-6 bg-retro-pink"
          />
        </aside>
      </div>
    </WelcomeCanvas>
  );
}

function MacosWelcome() {
  const { brand, folderName, photoCount, ready, sessionName, showPath } = useWelcomeData();

  return (
    <WelcomeCanvas className="relative flex flex-1 items-center justify-center px-6 py-12 md:px-12">
      <div className="relative grid w-full max-w-5xl grid-cols-1 items-center gap-10 md:grid-cols-[1.3fr_1fr] md:gap-14">
        <div>
          <div className="flex items-center gap-3">
            <Starburst size={52} />
            <span className="tape">{ready ? "Session ready" : "Waiting for session"}</span>
          </div>
          <h1 className="font-display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Welcome to <span className="text-primary">{brand.studioName}</span>.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            {brand.welcome}
          </p>
          <WelcomeCta ready={ready} tone="macos" />
        </div>
        <aside className="sticker overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <span className="text-sm font-medium">Session details</span>
            <LivePill ready={ready} labels={["Live", "Idle"]} />
          </div>
          <SessionTable
            folderName={folderName}
            photoCount={photoCount}
            ready={ready}
            sessionName={sessionName}
            showPath={showPath}
            tone="macos"
          />
        </aside>
      </div>
    </WelcomeCanvas>
  );
}

function BrutalismWelcome() {
  const { brand, folderName, photoCount, ready, sessionName, showPath } = useWelcomeData();

  return (
    <WelcomeCanvas className="relative flex flex-1 items-center justify-center px-6 py-12 md:px-12">
      <span className="absolute right-20 top-12 hidden md:block">
        <Starburst size={80} />
      </span>
      <span className="absolute bottom-20 left-16 hidden md:block">
        <Smiley size={64} />
      </span>

      <div className="relative grid w-full max-w-5xl grid-cols-1 items-center gap-12 md:grid-cols-[1.4fr_1fr] md:gap-16">
        <div className="relative">
          <span className="tape">{ready ? "Sesi siap" : "Menunggu sesi"}</span>
          <h1 className="font-display mt-4 text-5xl leading-[0.95] md:text-7xl">
            Frame
            <br />
            the <span className="text-primary">moment.</span>
            <span className="mt-4 block font-sans text-xl font-medium normal-case tracking-tight text-muted-foreground md:text-2xl">
              {brand.studioName}
            </span>
          </h1>
          <Wave className="-ml-2 mt-4 h-8 w-44 text-primary" />
          <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/80 md:text-lg">
            {brand.welcome}
          </p>
          <WelcomeCta ready={ready} tone="brutalism" />
        </div>

        <aside className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <span className="eyebrow">Session // Telemetry</span>
            <LivePill ready={ready} labels={["LIVE", "IDLE"]} />
          </div>
          <SessionTable
            folderName={folderName}
            photoCount={photoCount}
            ready={ready}
            sessionName={sessionName}
            showPath={showPath}
            tone="brutalism"
          />
        </aside>
      </div>
    </WelcomeCanvas>
  );
}

function BachelorWelcome() {
  const { brand, folderName, photoCount, ready, sessionName, showPath } = useWelcomeData();

  return (
    <WelcomeCanvas className="flex flex-1 items-center justify-center px-8 py-12">
      <div className="grid w-full max-w-3xl grid-cols-1 items-center gap-12 md:grid-cols-[1.2fr_1fr] md:gap-16">
        <div>
          <div className="eyebrow">{ready ? "Sesi siap" : "Menunggu sesi"}</div>
          <h1 className="font-display mt-3 text-5xl leading-[1.05] md:text-6xl">
            Selamat datang di
            <br />
            <span className="italic">{brand.studioName}.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            {brand.welcome}
          </p>
          <WelcomeCta ready={ready} tone="bachelor" />
        </div>
        <aside className="rounded-sm border border-border bg-card/70 p-7">
          <div className="eyebrow">Detail Sesi</div>
          <SessionDefinitionList
            folderName={folderName}
            photoCount={photoCount}
            ready={ready}
            sessionName={sessionName}
            showPath={showPath}
            tone="bachelor"
          />
        </aside>
      </div>
    </WelcomeCanvas>
  );
}

function WelcomeCanvas({ children, className }: { children: ReactNode; className: string }) {
  const background = useStudio((state) => state.brand.background);

  return (
    <div className={className}>
      {background && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url(${background})` }}
          />
          <div className="absolute inset-0 bg-background/70" />
        </>
      )}
      {children}
    </div>
  );
}

function WelcomeCta({
  ready,
  tone,
}: {
  ready: boolean;
  tone: "retro" | "macos" | "brutalism" | "bachelor";
}) {
  const base =
    tone === "retro"
      ? "group inline-flex items-center gap-3 rounded-full border-2 border-foreground bg-primary py-2.5 pl-6 pr-2 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[4px_4px_0_0_var(--color-foreground)] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-foreground)]"
      : tone === "brutalism"
        ? "group inline-flex items-center gap-3 rounded-full border border-primary bg-primary py-2.5 pl-6 pr-2 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
        : "group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 text-sm font-medium text-primary-foreground transition hover:opacity-90";

  return (
    <div className={tone === "bachelor" ? "mt-9" : "mt-8"}>
      <Link to={ready ? "/customer/frame" : "/admin/session"} className={base}>
        {ready ? "Mulai memilih frame" : "Buka panel admin"}
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full transition group-hover:translate-x-0.5 ${
            tone === "retro"
              ? "bg-retro-sun text-foreground"
              : tone === "brutalism"
                ? "bg-primary-foreground text-primary"
                : "bg-primary-foreground/15"
          }`}
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    </div>
  );
}

function LivePill({ ready, labels }: { ready: boolean; labels: [string, string] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs ${
        ready ? "text-[oklch(0.62_0.15_145)]" : "text-muted-foreground"
      }`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          ready ? "bg-[oklch(0.62_0.15_145)]" : "bg-muted-foreground"
        }`}
      />
      {ready ? labels[0] : labels[1]}
    </span>
  );
}

function SessionTable({
  folderName,
  photoCount,
  ready,
  sessionName,
  showPath,
  tone,
}: {
  folderName: string | null;
  photoCount: number;
  ready: boolean;
  sessionName: string;
  showPath: boolean;
  tone: "macos" | "brutalism";
}) {
  const labels =
    tone === "brutalism"
      ? {
          status: "status",
          active: "active",
          pending: "pending",
          folder: "folder",
          empty: "not_set",
          photos: "photos",
          session: "session",
        }
      : {
          status: "Status",
          active: "Active",
          pending: "Pending",
          folder: "Folder",
          empty: "Not set",
          photos: "Photos",
          session: "Session",
        };

  return (
    <>
      <table className="brut-table">
        <thead className={tone === "brutalism" ? "" : "hidden"}>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-muted-foreground">{labels.status}</td>
            <td className={tone === "brutalism" ? "font-bold" : "font-medium"}>
              {ready ? labels.active : labels.pending}
            </td>
          </tr>
          <tr>
            <td className="text-muted-foreground">{labels.folder}</td>
            <td className="break-all">
              {ready ? (
                showPath ? (
                  folderName
                ) : tone === "brutalism" ? (
                  "session_active"
                ) : (
                  "Session active"
                )
              ) : (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <FolderOpen className="h-3.5 w-3.5" />
                  {labels.empty}
                </span>
              )}
            </td>
          </tr>
          <tr>
            <td className="text-muted-foreground">{labels.photos}</td>
            <td
              className={`${tone === "brutalism" ? "font-bold text-primary" : "font-medium"} tabular-nums`}
            >
              {photoCount}
            </td>
          </tr>
          <tr>
            <td className="text-muted-foreground">{labels.session}</td>
            <td className="truncate">{sessionName || "-"}</td>
          </tr>
        </tbody>
      </table>
      {!ready && (
        <div className="border-t border-border px-5 py-3 text-xs leading-relaxed text-muted-foreground">
          Admin perlu memilih folder foto terlebih dahulu sebelum sesi customer dapat dimulai.
        </div>
      )}
    </>
  );
}

function SessionDefinitionList({
  folderName,
  photoCount,
  ready,
  sessionName,
  showPath,
  tone,
}: {
  folderName: string | null;
  photoCount: number;
  ready: boolean;
  sessionName: string;
  showPath: boolean;
  tone: "retro" | "bachelor";
}) {
  const separator =
    tone === "retro" ? (
      <div style={{ borderTop: "2px dashed var(--color-foreground)" }} />
    ) : (
      <div className="h-px bg-border" />
    );
  const statusClass =
    tone === "retro"
      ? "font-display mt-1 text-3xl italic leading-none"
      : "font-display mt-1 text-2xl leading-none";
  const labelClass =
    tone === "retro"
      ? "text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/60"
      : "text-[11px] uppercase tracking-[0.16em] text-muted-foreground";

  return (
    <dl className={tone === "retro" ? "mt-4 space-y-4" : "mt-5 space-y-4"}>
      <div>
        <dt className={labelClass}>Status</dt>
        <dd className={statusClass}>{ready ? "Aktif" : "Belum dimulai"}</dd>
      </div>
      {separator}
      <div>
        <dt className={labelClass}>Folder</dt>
        <dd className="mt-1 break-all text-sm font-medium">
          {ready ? (
            showPath ? (
              folderName
            ) : (
              "Session aktif"
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <FolderOpen className="h-3.5 w-3.5" />
              Belum dipilih
            </span>
          )}
        </dd>
      </div>
      {separator}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <dt className={labelClass}>Foto</dt>
          <dd className={statusClass}>{photoCount}</dd>
        </div>
        <div>
          <dt className={labelClass}>Sesi</dt>
          <dd className="mt-1 truncate text-sm font-medium">{sessionName || "-"}</dd>
        </div>
      </div>
      {!ready && (
        <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
          Admin perlu memilih folder foto terlebih dahulu sebelum sesi customer dapat dimulai.
        </p>
      )}
    </dl>
  );
}
