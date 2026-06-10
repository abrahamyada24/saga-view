import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── Studios (single-row brand config) ───────────────────────────────────────
export const studios = sqliteTable("studios", {
  id: text("id").primaryKey().$defaultFn(() => "default"),
  studioName: text("studio_name").default("Bachelor Snaps Studio"),
  welcome: text("welcome").default("Yuk pilih frame & foto terbaikmu!"),
  primary: text("primary"),
  accent: text("accent"),
  logo: text("logo"),
  background: text("background"),
  headingFont: text("heading_font"),
  bodyFont: text("body_font"),
  displayTheme: text("display_theme"),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// ─── Frames (frame catalog) ─────────────────────────────────────────────────
export const frames = sqliteTable("frames", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("Basic"),
  slots: integer("slots").notNull(),
  premium: integer("premium", { mode: "boolean" }).default(false),
  price: real("price").default(0),
  image: text("image"),
  bg: text("bg"),
  border: text("border"),
  accentColor: text("accent_color"),
  active: integer("active", { mode: "boolean" }).default(true),
  slotRects: text("slot_rects"),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// ─── Settings (single-row app settings) ──────────────────────────────────────
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().$defaultFn(() => "default"),
  photoTimerSec: integer("photo_timer_sec").default(120),
  editorTimerSec: integer("editor_timer_sec").default(180),
  timerOnExpire: text("timer_on_expire").default("add_time"),
  frameCategories: text("frame_categories").default('["Basic","Tema","Premium"]'),
  basicExtraPrice: real("basic_extra_price").default(10000),
  basicExtraEnabled: integer("basic_extra_enabled", { mode: "boolean" }).default(true),
  filenamePattern: text("filename_pattern").default("{sessionName}_Frame-{frameName}-{index}.png"),
  outputFormat: text("output_format").default("PNG"),
  resolution: text("resolution").default("4R"),
  dpi: integer("dpi").default(300),
  defaultTargetPhotos: integer("default_target_photos").default(10),
  autoFillDefault: integer("auto_fill_default", { mode: "boolean" }).default(true),
  requireReview: integer("require_review", { mode: "boolean" }).default(true),
  requirePayment: integer("require_payment", { mode: "boolean" }).default(true),
  autoClear: integer("auto_clear", { mode: "boolean" }).default(true),
  retentionDays: integer("retention_days").default(1),
  hidePath: integer("hide_path", { mode: "boolean" }).default(true),
  requireAdminPayment: integer("require_admin_payment", { mode: "boolean" }).default(true),
  blockCustomerAdmin: integer("block_customer_admin", { mode: "boolean" }).default(true),
  adminPin: text("admin_pin"),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// ─── Sessions (session log) ─────────────────────────────────────────────────
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  status: text("status").notNull().default("idle"),
  customerName: text("customer_name"),
  frameCount: integer("frame_count").default(0),
  photoCount: integer("photo_count").default(0),
  exportedAt: text("exported_at"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});
