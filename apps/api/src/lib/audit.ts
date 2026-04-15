import { PrismaClient } from "@prisma/client";

export function createAudit(prisma: PrismaClient) {
    return {
        log: async (data: {
            userId: string;
            action: string;
            documentId?: string;
            fileName?: string;
            metadata?: any;
        }) => {
            return prisma.auditEvent.create({
                data,
            });
        },
    };
}