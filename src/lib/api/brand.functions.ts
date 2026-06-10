import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getBrand, updateBrand, resetBrand } from "@/services/brand.service.server";
import { seedDatabase } from "@/db/seed.server";

// Ensure DB is seeded on first server function call
let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedDatabase();
    seeded = true;
  }
}

export const getBrandFn = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureSeeded();
    return await getBrand();
  });

export const updateBrandFn = createServerFn({ method: "POST" })
  .inputValidator(z.record(z.string(), z.unknown()))
  .handler(async ({ data }) => {
    await ensureSeeded();
    return await updateBrand("default", data);
  });

export const resetBrandFn = createServerFn({ method: "POST" })
  .handler(async () => {
    await ensureSeeded();
    return await resetBrand();
  });
