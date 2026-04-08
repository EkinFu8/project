import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

/** Load monorepo-root `.env` then `.env.local` before Prisma or other modules read `process.env`. */
if (process.env.NODE_ENV !== "production") {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(here, "../../..");

  dotenv.config({ path: path.join(repoRoot, ".env") });
  dotenv.config({ path: path.join(repoRoot, ".env.local"), override: true });
}
