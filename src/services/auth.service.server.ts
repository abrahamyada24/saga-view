import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/index.server";
import { settings } from "@/db/schema.server";

// ─── Hash Helper ────────────────────────────────────────────────────────────

export function hashPin(pin: string): string {
  return createHash("sha256").update(pin).digest("hex");
}

// ─── Service Functions ──────────────────────────────────────────────────────

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const rows = await db
    .select({ adminPin: settings.adminPin })
    .from(settings)
    .where(eq(settings.id, "default"))
    .limit(1);

  if (rows.length === 0 || !rows[0].adminPin) {
    // No pin set — first-time access, allow entry
    return true;
  }

  const hashed = hashPin(pin);
  return hashed === rows[0].adminPin;
}

export async function setAdminPin(pin: string): Promise<void> {
  const hashed = hashPin(pin);

  await db
    .update(settings)
    .set({
      adminPin: hashed,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(settings.id, "default"));
}
