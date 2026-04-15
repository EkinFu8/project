import type { Prisma, PrismaClient } from "@prisma/client";

export function createAudit(prisma: PrismaClient) {
  return {
    log: async (data: {
      userId: string;
      action: string;
      documentId?: string;
      fileName?: string;
      metadata?: Prisma.InputJsonValue;
    }) => {
      return prisma.auditEvent.create({
        data,
      });
    },
  };
}
