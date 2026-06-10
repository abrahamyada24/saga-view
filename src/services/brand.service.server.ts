import { eq } from "drizzle-orm";
import { db } from "@/db/index.server";
import { studios } from "@/db/schema.server";

// ─── Default Brand Values (Retro theme) ─────────────────────────────────────

const DEFAULT_BRAND = {
  id: "default" as const,
  studioName: "Bachelor Snaps Studio",
  welcome: "Yuk pilih frame & foto terbaikmu!",
  primary: "#202020",
  accent: "#bcdaea",
  logo: null,
  background: null,
  headingFont: "DM Serif Display",
  bodyFont: "Work Sans",
  displayTheme: JSON.stringify({
    presetId: "retro",
    background: "#bde6c3",
    surface: "#fdf6e3",
    text: "#202020",
    mutedText: "#706a5f",
    border: "#202020",
    accent: "#bcdaea",
    accentText: "#202020",
    primaryButton: "#202020",
    primaryButtonText: "#fff9e8",
    secondaryButton: "#f7c8c8",
    secondaryButtonText: "#202020",
    sidebar: "#fdf6e3",
    sidebarText: "#202020",
    sidebarAccent: "#f7c8c8",
    sidebarAccentText: "#202020",
    sidebarBorder: "#202020",
    decorativeA: "#f7c8c8",
    decorativeB: "#bcdaea",
    decorativeC: "#f6d94f",
    headingFont: "DM Serif Display",
    bodyFont: "Work Sans",
    panelRadius: 18,
    buttonRadius: 14,
  }),
};

// ─── Types ──────────────────────────────────────────────────────────────────

type BrandRow = typeof studios.$inferSelect;

type BrandResult = Omit<BrandRow, "displayTheme"> & {
  displayTheme: Record<string, unknown>;
};

function parseBrand(row: BrandRow): BrandResult {
  let displayTheme: Record<string, unknown> = {};
  try {
    displayTheme = row.displayTheme ? JSON.parse(row.displayTheme) : {};
  } catch {
    displayTheme = {};
  }
  return { ...row, displayTheme };
}

function getDefaultBrandResult(): BrandResult {
  return parseBrand(DEFAULT_BRAND as unknown as BrandRow);
}

// ─── Service Functions ──────────────────────────────────────────────────────

export async function getBrand(studioId = "default"): Promise<BrandResult> {
  const rows = await db
    .select()
    .from(studios)
    .where(eq(studios.id, studioId))
    .limit(1);

  if (rows.length === 0) {
    return getDefaultBrandResult();
  }

  return parseBrand(rows[0]);
}

export async function updateBrand(
  studioId: string,
  data: Record<string, unknown>,
): Promise<BrandResult> {
  const updateData = { ...data };

  // Stringify displayTheme if it's an object
  if (
    updateData.displayTheme &&
    typeof updateData.displayTheme === "object"
  ) {
    updateData.displayTheme = JSON.stringify(updateData.displayTheme);
  }

  // Set updatedAt timestamp
  updateData.updatedAt = new Date().toISOString();

  const result = await db
    .update(studios)
    .set(updateData)
    .where(eq(studios.id, studioId))
    .returning();

  if (result.length === 0) {
    // Row doesn't exist yet — insert
    await db.insert(studios).values({
      id: studioId,
      ...updateData,
    } as typeof studios.$inferInsert);

    return getBrand(studioId);
  }

  return parseBrand(result[0]);
}

export async function resetBrand(studioId = "default"): Promise<BrandResult> {
  await db.delete(studios).where(eq(studios.id, studioId));

  await db.insert(studios).values({
    ...DEFAULT_BRAND,
    id: studioId,
  });

  return getBrand(studioId);
}
