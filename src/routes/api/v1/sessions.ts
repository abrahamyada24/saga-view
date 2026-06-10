import { createFileRoute } from "@tanstack/react-router";

import { listSessions, createSession } from "@/services/session.service.server";
import { seedDatabase } from "@/db/seed.server";

let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedDatabase();
    seeded = true;
  }
}

export const Route = createFileRoute("/api/v1/sessions")({
  server: {
    handlers: {
      GET: async () => {
        await ensureSeeded();
        return Response.json(await listSessions());
      },
      POST: async ({ request }: { request: Request }) => {
        await ensureSeeded();
        const data = await request.json();
        const session = await createSession(data);
        return Response.json(session, { status: 201 });
      },
    } as Record<string, (ctx: { request: Request }) => Promise<Response>>,
  },
});
