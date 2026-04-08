import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Prevent multiple Prisma Client instances in development (HMR / watch mode)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "[prisma] DATABASE_URL is not set. Add it to the repo-root .env or .env.local (next to apps/), e.g. postgresql://postgres:postgres@127.0.0.1:54322/postgres for local Supabase.",
    );
  }

  const adapter = new PrismaPg(url);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["warn", "error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
