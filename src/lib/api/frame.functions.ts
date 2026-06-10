import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  listFrames,
  getFrame,
  createFrame,
  updateFrame,
  updateFrameSlots,
  deleteFrame,
} from "@/services/frame.service.server";
import { seedDatabase } from "@/db/seed.server";

// Ensure DB is seeded on first server function call
let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedDatabase();
    seeded = true;
  }
}

export const listFramesFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureSeeded();
    return await listFrames();
  });

export const getFrameFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await ensureSeeded();
    return await getFrame(data.id);
  });

export const createFrameFn = createServerFn({ method: "POST" })
  .inputValidator(z.record(z.string(), z.unknown()))
  .handler(async ({ data }) => {
    await ensureSeeded();
    return await createFrame(data);
  });

export const updateFrameFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }).passthrough())
  .handler(async ({ data }) => {
    await ensureSeeded();
    const { id, ...rest } = data;
    return await updateFrame(id, rest);
  });

export const updateFrameSlotsFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      slotRects: z.array(
        z.object({
          x: z.number(),
          y: z.number(),
          w: z.number(),
          h: z.number(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    await ensureSeeded();
    return await updateFrameSlots(data.id, data.slotRects);
  });

export const deleteFrameFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await ensureSeeded();
    return await deleteFrame(data.id);
  });
