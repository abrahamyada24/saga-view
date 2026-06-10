import { createFileRoute } from "@tanstack/react-router";

import { getBrand, updateBrand } from "@/services/brand.service.server";
import { seedDatabase } from "@/db/seed.server";

let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedDatabase();
    seeded = true;
  }
}

export const Route = createFileRoute("/api/v1/brands")({
  server: {
    handlers: {
      GET: async () => {
        await ensureSeeded();
        return Response.json(await getBrand());
      },
      PUT: async ({ request }: { request: Request }) => {
        await ensureSeeded();
        const data = await request.json();
        const result = await updateBrand("default", data);
        return Response.json(result);
      },
    } as Record<string, (ctx: { request: Request }) => Promise<Response>>,
  },
});
