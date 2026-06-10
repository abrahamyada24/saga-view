import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  listSessions,
  createSession,
  updateSession,
} from "@/services/session.service.server";
import { seedDatabase } from "@/db/seed.server";

// Ensure DB is seeded on first server function call
let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedDatabase();
    seeded = true;
  }
}

export const listSessionsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureSeeded();
    return await listSessions();
  });

export const createSessionFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().optional(),
      label: z.string().optional(),
      customerName: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    return await createSession(data);
  });

export const updateSessionFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ id: z.string() }).passthrough(),
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    const { id, ...rest } = data;
    return await updateSession(id, rest);
  });
