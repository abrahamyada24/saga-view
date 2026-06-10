import { eq, and } from "drizzle-orm";
import { db } from "@/db/index.server";
import { frames } from "@/db/schema.server";

// ─── Types ──────────────────────────────────────────────────────────────────

type SlotRect = { x: number; y: number; w: number; h: number };

type FrameRow = typeof frames.$inferSelect;

type FrameResult = Omit<FrameRow, "slotRects" | "accentColor"> & {
  slotRects: SlotRect[];
  accent?: string | null;
};

function parseFrame(row: FrameRow): FrameResult {
  let slotRects: SlotRect[] = [];
  try {
    slotRects = row.slotRects ? JSON.parse(row.slotRects) : [];
  } catch {
    slotRects = [];
  }
  return {
    ...row,
    slotRects,
    accent: row.accentColor,
  };
}

// ─── Service Functions ──────────────────────────────────────────────────────

export async function listFrames(filter?: {
  category?: string;
  active?: boolean;
}): Promise<FrameResult[]> {
  const conditions = [];

  if (filter?.category) {
    conditions.push(eq(frames.category, filter.category));
  }
  if (filter?.active !== undefined) {
    conditions.push(eq(frames.active, filter.active));
  }

  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(frames)
          .where(and(...conditions))
      : await db.select().from(frames);

  return rows.map(parseFrame);
}

export async function getFrame(id: string): Promise<FrameResult | null> {
  const rows = await db
    .select()
    .from(frames)
    .where(eq(frames.id, id))
    .limit(1);

  if (rows.length === 0) return null;
  return parseFrame(rows[0]);
}

export async function createFrame(
  data: Omit<typeof frames.$inferInsert, "slotRects"> & {
    slotRects?: SlotRect[] | string;
  },
): Promise<FrameResult> {
  const insertData = {
    ...data,
    slotRects:
      typeof data.slotRects === "string"
        ? data.slotRects
        : JSON.stringify(data.slotRects ?? []),
  };

  const result = await db
    .insert(frames)
    .values(insertData)
    .returning();

  return parseFrame(result[0]);
}

export async function updateFrame(
  id: string,
  data: Partial<
    Omit<typeof frames.$inferInsert, "slotRects"> & {
      slotRects?: SlotRect[] | string;
      accent?: string | null;
    }
  >,
): Promise<FrameResult | null> {
  const updateData: Record<string, unknown> = { ...data };

  // Map accent → accentColor column
  if ("accent" in updateData) {
    updateData.accentColor = updateData.accent;
    delete updateData.accent;
  }

  // Stringify slotRects if array
  if (Array.isArray(updateData.slotRects)) {
    updateData.slotRects = JSON.stringify(updateData.slotRects);
  }

  const result = await db
    .update(frames)
    .set(updateData)
    .where(eq(frames.id, id))
    .returning();

  if (result.length === 0) return null;
  return parseFrame(result[0]);
}

export async function updateFrameSlots(
  id: string,
  slotRects: SlotRect[],
): Promise<FrameResult | null> {
  const result = await db
    .update(frames)
    .set({
      slotRects: JSON.stringify(slotRects),
      slots: slotRects.length,
    })
    .where(eq(frames.id, id))
    .returning();

  if (result.length === 0) return null;
  return parseFrame(result[0]);
}

export async function deleteFrame(
  id: string,
): Promise<{ success: boolean; message?: string }> {
  // Don't allow deleting default frames
  const existing = await db
    .select({ isDefault: frames.isDefault })
    .from(frames)
    .where(eq(frames.id, id))
    .limit(1);

  if (existing.length === 0) {
    return { success: false, message: "Frame not found" };
  }

  if (existing[0].isDefault) {
    return { success: false, message: "Cannot delete a default frame" };
  }

  await db.delete(frames).where(eq(frames.id, id));
  return { success: true };
}
