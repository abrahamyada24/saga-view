import { eq } from "drizzle-orm";
import { db } from "@/db/index.server";
import { settings } from "@/db/schema.server";

// ─── Types ──────────────────────────────────────────────────────────────────

type SettingsRow = typeof settings.$inferSelect;

type SettingsResult = {
  id: string;
  photoTimerSec: number;
  editorTimerSec: number;
  timerOnExpire: string;
  frameCategories: string[];
  basicExtraPrice: number;
  basicExtraEnabled: boolean;
  filenamePattern: string;
  outputFormat: string;
  resolution: string;
  dpi: number;
  workflow: {
    defaultTargetPhotos: number;
    autoFillDefault: boolean;
    requireReview: boolean;
    requirePayment: boolean;
  };
  privacy: {
    autoClear: boolean;
    retentionDays: number;
    hidePath: boolean;
    requireAdminPayment: boolean;
    blockCustomerAdmin: boolean;
  };
  adminPin: string | null;
  updatedAt: string | null;
};

function parseSettings(row: SettingsRow): SettingsResult {
  let frameCategories: string[] = ["Basic", "Tema", "Premium"];
  try {
    frameCategories = row.frameCategories
      ? JSON.parse(row.frameCategories)
      : frameCategories;
  } catch {
    // keep default
  }

  return {
    id: row.id,
    photoTimerSec: row.photoTimerSec ?? 120,
    editorTimerSec: row.editorTimerSec ?? 180,
    timerOnExpire: row.timerOnExpire ?? "add_time",
    frameCategories,
    basicExtraPrice: row.basicExtraPrice ?? 10000,
    basicExtraEnabled: row.basicExtraEnabled ?? true,
    filenamePattern:
      row.filenamePattern ??
      "{sessionName}_Frame-{frameName}-{index}.png",
    outputFormat: row.outputFormat ?? "PNG",
    resolution: row.resolution ?? "4R",
    dpi: row.dpi ?? 300,
    workflow: {
      defaultTargetPhotos: row.defaultTargetPhotos ?? 10,
      autoFillDefault: row.autoFillDefault ?? true,
      requireReview: row.requireReview ?? true,
      requirePayment: row.requirePayment ?? true,
    },
    privacy: {
      autoClear: row.autoClear ?? true,
      retentionDays: row.retentionDays ?? 1,
      hidePath: row.hidePath ?? true,
      requireAdminPayment: row.requireAdminPayment ?? true,
      blockCustomerAdmin: row.blockCustomerAdmin ?? true,
    },
    adminPin: row.adminPin,
    updatedAt: row.updatedAt,
  };
}

// ─── Service Functions ──────────────────────────────────────────────────────

export async function getSettings(id = "default"): Promise<SettingsResult> {
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.id, id))
    .limit(1);

  if (rows.length === 0) {
    // Return defaults
    return parseSettings({
      id: "default",
      photoTimerSec: 120,
      editorTimerSec: 180,
      timerOnExpire: "add_time",
      frameCategories: '["Basic","Tema","Premium"]',
      basicExtraPrice: 10000,
      basicExtraEnabled: true,
      filenamePattern: "{sessionName}_Frame-{frameName}-{index}.png",
      outputFormat: "PNG",
      resolution: "4R",
      dpi: 300,
      defaultTargetPhotos: 10,
      autoFillDefault: true,
      requireReview: true,
      requirePayment: true,
      autoClear: true,
      retentionDays: 1,
      hidePath: true,
      requireAdminPayment: true,
      blockCustomerAdmin: true,
      adminPin: null,
      updatedAt: null,
    });
  }

  return parseSettings(rows[0]);
}

export async function updateSettings(
  id: string,
  data: Partial<SettingsResult>,
): Promise<SettingsResult> {
  const updateData: Record<string, unknown> = {};

  // Flatten workflow sub-object
  if (data.workflow) {
    if (data.workflow.defaultTargetPhotos !== undefined)
      updateData.defaultTargetPhotos = data.workflow.defaultTargetPhotos;
    if (data.workflow.autoFillDefault !== undefined)
      updateData.autoFillDefault = data.workflow.autoFillDefault;
    if (data.workflow.requireReview !== undefined)
      updateData.requireReview = data.workflow.requireReview;
    if (data.workflow.requirePayment !== undefined)
      updateData.requirePayment = data.workflow.requirePayment;
  }

  // Flatten privacy sub-object
  if (data.privacy) {
    if (data.privacy.autoClear !== undefined)
      updateData.autoClear = data.privacy.autoClear;
    if (data.privacy.retentionDays !== undefined)
      updateData.retentionDays = data.privacy.retentionDays;
    if (data.privacy.hidePath !== undefined)
      updateData.hidePath = data.privacy.hidePath;
    if (data.privacy.requireAdminPayment !== undefined)
      updateData.requireAdminPayment = data.privacy.requireAdminPayment;
    if (data.privacy.blockCustomerAdmin !== undefined)
      updateData.blockCustomerAdmin = data.privacy.blockCustomerAdmin;
  }

  // Top-level scalar fields
  const scalarKeys = [
    "photoTimerSec",
    "editorTimerSec",
    "timerOnExpire",
    "basicExtraPrice",
    "basicExtraEnabled",
    "filenamePattern",
    "outputFormat",
    "resolution",
    "dpi",
    "adminPin",
  ] as const;

  for (const key of scalarKeys) {
    if (data[key] !== undefined) {
      updateData[key] = data[key];
    }
  }

  // JSON stringify frameCategories if array
  if (data.frameCategories) {
    updateData.frameCategories = Array.isArray(data.frameCategories)
      ? JSON.stringify(data.frameCategories)
      : data.frameCategories;
  }

  // Update timestamp
  updateData.updatedAt = new Date().toISOString();

  const result = await db
    .update(settings)
    .set(updateData)
    .where(eq(settings.id, id))
    .returning();

  if (result.length === 0) {
    // Fallback: row didn't exist, insert it
    await db.insert(settings).values({
      id,
      ...updateData,
    } as typeof settings.$inferInsert);
  }

  return getSettings(id);
}
