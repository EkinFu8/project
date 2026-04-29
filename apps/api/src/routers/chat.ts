import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../lib/trpc";

const conversationIdSchema = z.object({
  conversationId: z.string().uuid(),
});

const messageRoleSchema = z.enum(["user", "assistant"]);

function titleFromMessage(content: string) {
  const compact = content.replace(/\s+/g, " ").trim();
  if (!compact) return "New chat";
  return compact.length > 72 ? `${compact.slice(0, 69)}...` : compact;
}

async function assertOwnConversation(prisma: PrismaClient, userId: string, conversationId: string) {
  const conversation = await prisma.chatConversation.findFirst({
    where: { id: conversationId, userId },
  });

  if (!conversation) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found." });
  }

  return conversation;
}

export const chatRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.chatConversation.findMany({
      where: { userId: ctx.user.id },
      orderBy: { updatedAt: "desc" },
      take: 30,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await ctx.prisma.chatConversation.findMany({
      where: { userId: ctx.user.id },
      select: {
        readAt: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { role: true },
        },
      },
    });

    return conversations.filter((conversation) => {
      const last = conversation.messages[0];
      if (last?.role !== "assistant") return false;
      return !conversation.readAt || conversation.updatedAt > conversation.readAt;
    }).length;
  }),

  create: protectedProcedure
    .input(z.object({ title: z.string().trim().min(1).max(120).optional() }).optional())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.chatConversation.create({
        data: {
          userId: ctx.user.id,
          title: input?.title ?? "New chat",
          readAt: new Date(),
        },
      });
    }),

  get: protectedProcedure.input(conversationIdSchema).query(async ({ ctx, input }) => {
    await assertOwnConversation(ctx.prisma, ctx.user.id, input.conversationId);
    return ctx.prisma.chatConversation.findUniqueOrThrow({
      where: { id: input.conversationId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }),

  addMessage: protectedProcedure
    .input(
      conversationIdSchema.extend({
        role: messageRoleSchema,
        content: z.string().trim().min(1).max(20_000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const conversation = await assertOwnConversation(
        ctx.prisma,
        ctx.user.id,
        input.conversationId,
      );
      const message = await ctx.prisma.chatMessage.create({
        data: {
          conversationId: input.conversationId,
          role: input.role,
          content: input.content,
        },
      });

      const shouldRetitle = conversation.title === "New chat" && input.role === "user";
      await ctx.prisma.chatConversation.update({
        where: { id: input.conversationId },
        data: {
          ...(shouldRetitle ? { title: titleFromMessage(input.content) } : {}),
          readAt: input.role === "assistant" ? conversation.readAt : new Date(),
        },
      });

      return message;
    }),

  markRead: protectedProcedure.input(conversationIdSchema).mutation(async ({ ctx, input }) => {
    await assertOwnConversation(ctx.prisma, ctx.user.id, input.conversationId);
    return ctx.prisma.chatConversation.update({
      where: { id: input.conversationId },
      data: { readAt: new Date() },
    });
  }),

  delete: protectedProcedure.input(conversationIdSchema).mutation(async ({ ctx, input }) => {
    await assertOwnConversation(ctx.prisma, ctx.user.id, input.conversationId);
    await ctx.prisma.chatConversation.delete({ where: { id: input.conversationId } });
    return { success: true };
  }),
});
