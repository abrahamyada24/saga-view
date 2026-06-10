import { eq, desc } from "drizzle-orm";
import { db } from "@/db/index.server";
import { sessions } from "@/db/schema.server";

// ─── Types ──────────────────────────────────────────────────────────────────

type SessionRow = typeof sessions.$inferSelect;
type SessionInsert = typeof sessions.$inferInsert;

// ─── Service Functions ──────────────────────────────────────────────────────

export async function listSessions(): Promise<SessionRow[]> {
  return db
    .select()
    .from(sessions)
    .orderBy(desc(sessions.createdAt));
}

export async function getSession(id: string): Promise<SessionRow | null> {
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1);

  return rows.length > 0 ? rows[0] : null;
}

export async function createSession(data: {
  id: string;
  label: string;
  customerName?: string;
}): Promise<SessionRow> {
  const result = await db
    .insert(sessions)
    .values({
      id: data.id,
      label: data.label,
      customerName: data.customerName ?? null,
    } satisfies SessionInsert)
    .returning();

  return result[0];
}

export async function updateSession(
  id: string,
  data: Partial<Omit<SessionInsert, "id">>,
): Promise<SessionRow | null> {
  const result = await db
    .update(sessions)
    .set(data)
    .where(eq(sessions.id, id))
    .returning();

  return result.length > 0 ? result[0] : null;
}
