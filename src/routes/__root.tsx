import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { useStudio } from "@/lib/studio-store";
import { applyDisplayTheme, normalizeDisplayTheme } from "@/lib/display-theme";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      {
        name: "description",
        content:
          "A local self-photo studio preview app for selecting real customer photos, frames, and export-ready layouts.",
      },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      {
        property: "og:description",
        content:
          "A local self-photo studio preview app for selecting real customer photos, frames, and export-ready layouts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      {
        name: "twitter:description",
        content:
          "A local self-photo studio preview app for selecting real customer photos, frames, and export-ready layouts.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/50c0954c-ecca-486b-816d-e5d57993498d/id-preview-b5b881f2--d43b5f5e-5849-46e6-a7bb-103158ee4a21.lovable.app-1780584763669.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/50c0954c-ecca-486b-816d-e5d57993498d/id-preview-b5b881f2--d43b5f5e-5849-46e6-a7bb-103158ee4a21.lovable.app-1780584763669.png",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const initFromServer = useStudio((state) => state.initFromServer);

  useEffect(() => {
    initFromServer();
  }, [initFromServer]);

  // F11 fullscreen toggle for Tauri desktop app
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        e.stopPropagation();
        try {
          // Primary: use Rust-side command (most reliable)
          const { invoke } = await import("@tauri-apps/api/core");
          await invoke("toggle_fullscreen");
        } catch (invokeErr) {
          console.warn("[SagaView] invoke toggle_fullscreen failed, trying JS API:", invokeErr);
          try {
            // Fallback: use Tauri JS window API
            const { getCurrentWindow } = await import("@tauri-apps/api/window");
            const appWindow = getCurrentWindow();
            const isFullscreen = await appWindow.isFullscreen();
            await appWindow.setFullscreen(!isFullscreen);
          } catch (jsErr: any) {
            console.error("[SagaView] F11 fullscreen toggle failed:", jsErr);
            import("sonner").then(({ toast }) => {
              toast.error("F11 Error", { 
                description: `Invoke err: ${String(invokeErr)} | JS API err: ${String(jsErr)}` 
              });
            });
          }
        }
      }
    };
    // Use capture phase for higher priority event interception
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DisplayThemeRuntime />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}

function DisplayThemeRuntime() {
  const display = useStudio((state) => state.brand.display);

  useEffect(() => {
    applyDisplayTheme(normalizeDisplayTheme(display));
  }, [display]);

  return null;
}
