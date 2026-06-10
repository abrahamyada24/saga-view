import { createFileRoute } from "@tanstack/react-router";

import { saveFrameImage } from "@/services/upload.service.server";
import { seedDatabase } from "@/db/seed.server";

let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedDatabase();
    seeded = true;
  }
}

export const Route = createFileRoute("/api/v1/upload")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        await ensureSeeded();
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const frameId = formData.get("frameId") as string | null;

        if (!file) {
          return Response.json({ error: "Missing file" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const path = await saveFrameImage(
          buffer,
          file.name,
          frameId ?? undefined,
        );
        return Response.json({ path });
      },
    } as Record<string, (ctx: { request: Request }) => Promise<Response>>,
  },
});
