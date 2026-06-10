import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getSettings, updateSettings } from "@/services/settings.service.server";
import { seedDatabase } from "@/db/seed.server";

// Ensure DB is seeded on first server function call
let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedDatabase();
    seeded = true;
  }
}

export const getSettingsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureSeeded();
    return await getSettings();
  });

export const updateSettingsFn = createServerFn({ method: "POST" })
  .inputValidator(z.record(z.string(), z.unknown()))
  .handler(async ({ data }) => {
    await ensureSeeded();
    return await updateSettings("default", data);
  });
