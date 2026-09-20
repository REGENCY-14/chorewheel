import { defineConfig } from "drizzle-kit";
import "dotenv/config";

// Only `db:migrate`/`db:studio` actually connect; `db:generate` just diffs
// the schema against ./drizzle, so a missing DATABASE_URL shouldn't block it.
export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://placeholder/placeholder",
  },
});
