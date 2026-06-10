import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as schema from "./schema.server";

const DB_URL = process.env.DB_PATH || "file:./data/studio.db";

// Ensure data directory exists
const filePath = DB_URL.replace(/^file:/, "");
try {
  mkdirSync(dirname(filePath), { recursive: true });
} catch {
  // directory may already exist
}

export const db = drizzle({
  connection: DB_URL,
  schema,
});

export { schema };
