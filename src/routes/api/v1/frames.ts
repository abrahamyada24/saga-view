import { createFileRoute } from "@tanstack/react-router";

import {
  listFrames,
  createFrame,
  updateFrame,
  deleteFrame,
} from "@/services/frame.service.server";
import { seedDatabase } from "@/db/seed.server";

let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedDatabase();
    seeded = true;
  }
}

export const Route = createFileRoute("/api/v1/frames")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        await ensureSeeded();
        const url = new URL(request.url);
        const category = url.searchParams.get("category") ?? undefined;
        const active = url.searchParams.get("active");
        const filters: Record<string, unknown> = {};
        if (category) filters.category = category;
        if (active !== null) filters.active = active === "true";
        const frames = await listFrames(
          Object.keys(filters).length ? filters : undefined,
        );
        return Response.json(frames);
      },
      POST: async ({ request }: { request: Request }) => {
        await ensureSeeded();
        const data = await request.json();
        const frame = await createFrame(data);
        return Response.json(frame, { status: 201 });
      },
      PUT: async ({ request }: { request: Request }) => {
        await ensureSeeded();
        const body = await request.json();
        const { id, ...rest } = body;
        const frame = await updateFrame(id, rest);
        return Response.json(frame);
      },
      DELETE: async ({ request }: { request: Request }) => {
        await ensureSeeded();
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) {
          return Response.json(
            { error: "Missing id parameter" },
            { status: 400 },
          );
        }
        await deleteFrame(id);
        return Response.json({ success: true });
      },
    } as Record<string, (ctx: { request: Request }) => Promise<Response>>,
  },
});
