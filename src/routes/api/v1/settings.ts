import { createFileRoute } from "@tanstack/react-router";

import { getSettings, updateSettings } from "@/services/settings.service.server";
import { seedDatabase } from "@/db/seed.server";

let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedDatabase();
    seeded = true;
  }
}

export const Route = createFileRoute("/api/v1/settings")({
  server: {
    handlers: {
      GET: async () => {
        await ensureSeeded();
        return Response.json(await getSettings());
      },
      PUT: async ({ request }: { request: Request }) => {
        await ensureSeeded();
        const data = await request.json();
        const result = await updateSettings("default", data);
        return Response.json(result);
      },
    } as Record<string, (ctx: { request: Request }) => Promise<Response>>,
  },
});
