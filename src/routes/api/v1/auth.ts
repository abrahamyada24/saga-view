import { createFileRoute } from "@tanstack/react-router";

import {
  verifyAdminPin,
  setAdminPin,
} from "@/services/auth.service.server";
import { seedDatabase } from "@/db/seed.server";

let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedDatabase();
    seeded = true;
  }
}

export const Route = createFileRoute("/api/v1/auth")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        await ensureSeeded();
        const body = await request.json();

        switch (body.action) {
          case "verify": {
            const valid = await verifyAdminPin(body.pin);
            return Response.json({ valid });
          }
          case "set-pin": {
            await setAdminPin(body.pin);
            return Response.json({ success: true });
          }
          default:
            return Response.json(
              { error: `Unknown action: ${body.action}` },
              { status: 400 },
            );
        }
      },
    } as Record<string, (ctx: { request: Request }) => Promise<Response>>,
  },
});
