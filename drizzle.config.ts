import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.server.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_PATH || "file:./data/studio.db",
  },
} satisfies Config;
