import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Prevent multiple Prisma Client instances in development (HMR / watch mode)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["warn", "error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
