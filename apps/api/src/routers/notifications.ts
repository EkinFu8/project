import { z } from "zod";
import { adminPortalProcedure, protectedProcedure, router } from "../lib/trpc";

// ---------------------------------------------------------------------------
// Local types (Prisma loses row types when `where` is Record<string, unknown>)
// ---------------------------------------------------------------------------

type ContentSummaryRow = {
  fileID: string;
  filename: string | null;
  expiration_date: Date | null;
  next_review_date: Date | null;
};

type AuditChangeEventRow = {
  id: string;
  action: string;
  createdAt: Date;
  fileName: string | null;
  documentId: string | null;
  userId: string;
  user: { name: string } | null;
};

type AuditOwnershipEventRow = {
  id: string;
  createdAt: Date;
  fileName: string | null;
  documentId: string | null;
  metadata: unknown;
  user: { name: string } | null;
};

type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  urgency: string;
  publishedAt: Date;
  expiresAt: Date | null;
  author: { name: string } | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeRole(role?: string | null) {
  return (role ?? "").toLowerCase().replace(/\s+/g, "-").trim();
}

function roleVariants(role?: string | null) {
  const normalized = normalizeRole(role);
  if (!normalized) return [];
  return [
    normalized,
    normalized.replace(/-/g, " "),
    normalized.charAt(0).toUpperCase() + normalized.slice(1).replace(/-/g, " "),
  ];
}

/** Map raw urgency string → our tier type */
function toUrgency(raw: string): "critical" | "high" | "warning" | "info" {
  if (raw === "critical") return "critical";
  if (raw === "high") return "high";
  if (raw === "warning") return "warning";
  return "info";
}

/**
 * Compute urgency tier from time-until-event (ms).
 *  past         → critical   (expired / overdue)
 *  ≤ 7 days     → high       (expiring this week)
 *  ≤ 15 days    → warning    (expiring soon)
 *  > 15 days    → info       (still in processing)
 */
function timeBasedUrgency(target: Date, now: number): "critical" | "high" | "warning" | "info" {
  const t = target.getTime();
  if (t < now) return "critical";
  const daysLeft = (t - now) / (24 * 60 * 60 * 1000);
  if (daysLeft <= 7) return "high";
  if (daysLeft <= 15) return "warning";
  return "info";
}

const LOOKAHEAD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const COALESCE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// ---------------------------------------------------------------------------
// Coalesce repeated edits by the same user on the same doc within 1 hour
// ---------------------------------------------------------------------------
function coalesceChangeEvents(events: AuditChangeEventRow[]): AuditChangeEventRow[] {
  const seen = new Map<string, AuditChangeEventRow>();
  const result: AuditChangeEventRow[] = [];

  for (const event of events) {
    const key = `${event.documentId ?? ""}:${event.userId}:${event.action}`;
    const existing = seen.get(key);
    if (
      existing &&
      Math.abs(existing.createdAt.getTime() - event.createdAt.getTime()) < COALESCE_WINDOW_MS
    ) {
      // Keep the latest timestamp; already in result array — update in place
      if (event.createdAt > existing.createdAt) {
        existing.createdAt = event.createdAt;
      }
      continue;
    }
    seen.set(key, event);
    result.push(event);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const notificationsRouter = router({
  // -------------------------------------------------------------------------
  // myList — returns all notifications for the current user with state merged
  // -------------------------------------------------------------------------
  myList: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.userProfile.findUnique({
      where: { id: ctx.user.id },
      select: { role: true },
    });

    const isAdmin = profile?.role === "admin";
    const contentWhere: Record<string, unknown> = isAdmin
      ? {}
      : {
          OR: [{ job_position: null }, { job_position: { in: roleVariants(profile?.role) } }],
        };

    // Fetch content, change events, announcements, and state in parallel
    // Ownership events are fetched in a second step once we have content ids
    const [content, rawChangeEvents, announcements, stateRows] = await Promise.all([
      ctx.prisma.contentManagement.findMany({
        where: contentWhere,
        select: {
          fileID: true,
          filename: true,
          expiration_date: true,
          next_review_date: true,
        },
        orderBy: { fileID: "asc" },
      }) as Promise<ContentSummaryRow[]>,

      ctx.prisma.auditEvent
        .findMany({
          where: {
            action: { in: ["upload", "edit"] },
            ...(isAdmin
              ? {}
              : {
                  documentId: {
                    in: await ctx.prisma.contentManagement
                      .findMany({ where: contentWhere, select: { fileID: true } })
                      .then((rows) => rows.map((r) => r.fileID)),
                  },
                }),
          },
          select: {
            id: true,
            action: true,
            createdAt: true,
            fileName: true,
            documentId: true,
            userId: true,
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 200,
        })
        .then((rows) => rows as AuditChangeEventRow[]),

      ctx.prisma.announcement
        .findMany({
          where: {
            OR: [{ audience: "all" }, { audience: "roles" }],
            AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }],
          },
          select: {
            id: true,
            title: true,
            body: true,
            urgency: true,
            audience: true,
            targetRoles: true,
            publishedAt: true,
            expiresAt: true,
            author: { select: { name: true } },
          },
          orderBy: { publishedAt: "desc" },
        })
        .then((rows) => rows as (AnnouncementRow & { audience: string; targetRoles: string[] })[]),

      ctx.prisma.notificationState.findMany({
        where: { userId: ctx.user.id },
        select: {
          notificationKey: true,
          readAt: true,
          pinnedAt: true,
          deletedAt: true,
        },
      }),
    ]);

    const byFileId = new Map(content.map((row) => [row.fileID, row]));
    const ids = content.map((row) => row.fileID);

    // Re-run ownership query with correct ids (two-step due to Promise.all ordering)
    const ownershipEventsFiltered: AuditOwnershipEventRow[] =
      ids.length === 0
        ? []
        : ((await ctx.prisma.auditEvent.findMany({
            where: { action: "ownership-update", documentId: { in: ids } },
            select: {
              id: true,
              createdAt: true,
              fileName: true,
              documentId: true,
              metadata: true,
              user: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
          })) as AuditOwnershipEventRow[]);

    // State lookup map
    const stateMap = new Map(stateRows.map((s) => [s.notificationKey, s]));

    const now = Date.now();
    const lookaheadHorizon = now + LOOKAHEAD_MS; // 30 days → still show

    // Suppress self-authored change events, then coalesce
    const changeEvents = coalesceChangeEvents(
      rawChangeEvents.filter((e) => e.userId !== ctx.user.id),
    );

    // Filter announcements for this user's role
    const userRole = profile?.role ?? "";
    const visibleAnnouncements = announcements.filter((a) => {
      if (a.audience === "all") return true;
      if (a.audience === "roles") {
        return roleVariants(userRole).some((v) => a.targetRoles.includes(v));
      }
      return false;
    });

    const rows = [
      // Announcements
      ...visibleAnnouncements.map((a) => {
        const key = `announcement-${a.id}`;
        const state = stateMap.get(key);
        return {
          id: key,
          type: "announcement" as const,
          urgency: toUrgency(a.urgency),
          createdAt: a.publishedAt,
          fileID: null as string | null,
          fileName: a.title,
          message: a.body,
          actorName: a.author?.name ?? null,
          isRead: state?.readAt != null,
          isPinned: state?.pinnedAt != null,
          isDeleted: state?.deletedAt != null,
        };
      }),

      // Document change events
      ...changeEvents.map((event) => {
        const docId = event.documentId ?? "";
        const fallbackName = docId ? byFileId.get(docId)?.filename : undefined;
        const key = `change-${event.id}`;
        const state = stateMap.get(key);
        return {
          id: key,
          type: "document-change" as const,
          urgency: "info" as const,
          createdAt: event.createdAt,
          fileID: docId,
          fileName: event.fileName ?? fallbackName ?? (docId || "Unknown document"),
          message: event.action === "upload" ? "New content was added." : "This item was updated.",
          actorName: event.user?.name ?? null,
          isRead: state?.readAt != null,
          isPinned: state?.pinnedAt != null,
          isDeleted: state?.deletedAt != null,
        };
      }),

      // Review date notifications
      ...content
        .filter((row) => {
          if (!row.next_review_date) return false;
          return row.next_review_date.getTime() <= lookaheadHorizon;
        })
        .map((row) => {
          const reviewDate = row.next_review_date as Date;
          const overdue = reviewDate.getTime() < now;
          const urgency = timeBasedUrgency(reviewDate, now);
          const daysLeft = Math.max(0, Math.round((reviewDate.getTime() - now) / 86_400_000));
          const key = `review-${row.fileID}`;
          const state = stateMap.get(key);
          return {
            id: key,
            type: "expiration" as const,
            urgency,
            createdAt: reviewDate,
            fileID: row.fileID,
            fileName: row.filename ?? row.fileID,
            message: overdue
              ? "Review date passed — follow up."
              : daysLeft <= 7
                ? `Review due in ${daysLeft === 0 ? "less than a day" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`}.`
                : daysLeft <= 15
                  ? `Review due in ${daysLeft} days — coming up.`
                  : `Review due in ${daysLeft} days.`,
            actorName: null,
            isRead: state?.readAt != null,
            isPinned: state?.pinnedAt != null,
            isDeleted: state?.deletedAt != null,
          };
        }),

      // Expiration notifications
      ...content
        .filter((row) => {
          if (!row.expiration_date) return false;
          return row.expiration_date.getTime() <= lookaheadHorizon;
        })
        .map((row) => {
          const expiry = row.expiration_date as Date;
          const expired = expiry.getTime() < now;
          const urgency = timeBasedUrgency(expiry, now);
          const daysLeft = Math.max(0, Math.round((expiry.getTime() - now) / 86_400_000));
          const key = `expiration-${row.fileID}`;
          const state = stateMap.get(key);
          return {
            id: key,
            type: "expiration" as const,
            urgency,
            createdAt: expiry,
            fileID: row.fileID,
            fileName: row.filename ?? row.fileID,
            message: expired
              ? "Document expired — follow up with the owner."
              : daysLeft <= 7
                ? `Expires in ${daysLeft === 0 ? "less than a day" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`} — act soon.`
                : daysLeft <= 15
                  ? `Expires in ${daysLeft} days — coming up.`
                  : `Expires in ${daysLeft} days.`,
            actorName: null,
            isRead: state?.readAt != null,
            isPinned: state?.pinnedAt != null,
            isDeleted: state?.deletedAt != null,
          };
        }),

      // Ownership change events
      ...ownershipEventsFiltered.map((event) => {
        const meta = (event.metadata ?? {}) as {
          oldOwnerName?: string | null;
          newOwnerName?: string | null;
        };
        const from = meta.oldOwnerName ?? "Unassigned";
        const to = meta.newOwnerName ?? "Unassigned";
        const key = `ownership-${event.id}`;
        const state = stateMap.get(key);
        return {
          id: key,
          type: "ownership-update" as const,
          urgency: "info" as const,
          createdAt: event.createdAt,
          fileID: event.documentId ?? "",
          fileName: event.fileName ?? event.documentId ?? "Unknown document",
          message: `Owner changed (${from} → ${to}).`,
          actorName: event.user?.name ?? null,
          isRead: state?.readAt != null,
          isPinned: state?.pinnedAt != null,
          isDeleted: state?.deletedAt != null,
        };
      }),
    ];

    const filtered = rows.filter((r) => !r.isDeleted);
    const sorted = filtered.sort((a, b) => {
      // Pinned items first, then by date desc
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return {
      items: sorted.slice(0, 200),
      unreadCount: sorted.filter((r) => !r.isRead).length,
    };
  }),

  // -------------------------------------------------------------------------
  // setRead — mark keys as read or unread
  // -------------------------------------------------------------------------
  setRead: protectedProcedure
    .input(
      z.object({
        keys: z.array(z.string().min(1)).min(1).max(100),
        read: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      await Promise.all(
        input.keys.map((key) =>
          ctx.prisma.notificationState.upsert({
            where: { userId_notificationKey: { userId: ctx.user.id, notificationKey: key } },
            create: {
              userId: ctx.user.id,
              notificationKey: key,
              readAt: input.read ? now : null,
            },
            update: { readAt: input.read ? now : null },
          }),
        ),
      );

      // Preserve audit trail for notification-view events
      if (input.read) {
        await ctx.prisma.auditEvent.createMany({
          data: input.keys.map((key) => ({
            userId: ctx.user.id,
            action: "notification-view",
            metadata: { notificationId: key },
          })),
          skipDuplicates: true,
        });
      }

      return { success: true };
    }),

  // -------------------------------------------------------------------------
  // setPinned — pin or unpin notifications
  // -------------------------------------------------------------------------
  setPinned: protectedProcedure
    .input(
      z.object({
        keys: z.array(z.string().min(1)).min(1).max(100),
        pinned: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      await Promise.all(
        input.keys.map((key) =>
          ctx.prisma.notificationState.upsert({
            where: { userId_notificationKey: { userId: ctx.user.id, notificationKey: key } },
            create: {
              userId: ctx.user.id,
              notificationKey: key,
              pinnedAt: input.pinned ? now : null,
            },
            update: { pinnedAt: input.pinned ? now : null },
          }),
        ),
      );
      return { success: true };
    }),

  // -------------------------------------------------------------------------
  // delete — soft-delete notifications
  // -------------------------------------------------------------------------
  delete: protectedProcedure
    .input(z.object({ keys: z.array(z.string().min(1)).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      await Promise.all(
        input.keys.map((key) =>
          ctx.prisma.notificationState.upsert({
            where: { userId_notificationKey: { userId: ctx.user.id, notificationKey: key } },
            create: { userId: ctx.user.id, notificationKey: key, deletedAt: now },
            update: { deletedAt: now },
          }),
        ),
      );
      return { success: true };
    }),

  // -------------------------------------------------------------------------
  // markViewed — kept for backwards compat (used by App.tsx metrics)
  // -------------------------------------------------------------------------
  markViewed: protectedProcedure
    .input(
      z.object({
        notifications: z
          .array(
            z.object({
              id: z.string().min(1),
              type: z.string().min(1),
              fileID: z.string().optional(),
              fileName: z.string().optional(),
              createdAt: z.coerce.date(),
            }),
          )
          .max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.notifications.length === 0) return { success: true, count: 0 };

      await ctx.prisma.auditEvent.createMany({
        data: input.notifications.map((n) => ({
          userId: ctx.user.id,
          action: "notification-view",
          documentId: n.fileID || null,
          fileName: n.fileName || null,
          metadata: {
            notificationId: n.id,
            notificationType: n.type,
            notificationCreatedAt: n.createdAt.toISOString(),
          },
        })),
      });

      return { success: true, count: input.notifications.length };
    }),

  // -------------------------------------------------------------------------
  // adminList — admin-only: fetch all announcements
  // -------------------------------------------------------------------------
  adminListAnnouncements: adminPortalProcedure.query(async ({ ctx }) => {
    return ctx.prisma.announcement.findMany({
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        body: true,
        urgency: true,
        audience: true,
        targetRoles: true,
        publishedAt: true,
        expiresAt: true,
        author: { select: { id: true, name: true } },
      },
    });
  }),

  // -------------------------------------------------------------------------
  // createAnnouncement — admin only
  // -------------------------------------------------------------------------
  createAnnouncement: adminPortalProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        body: z.string().min(1),
        urgency: z.enum(["info", "warning", "high", "critical"]).default("info"),
        audience: z.enum(["all", "roles"]).default("all"),
        targetRoles: z.array(z.string()).default([]),
        expiresAt: z.coerce.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.announcement.create({
        data: {
          authorId: ctx.user.id,
          title: input.title,
          body: input.body,
          urgency: input.urgency,
          audience: input.audience,
          targetRoles: input.targetRoles,
          expiresAt: input.expiresAt ?? null,
        },
      });
    }),

  // -------------------------------------------------------------------------
  // updateAnnouncement — admin only
  // -------------------------------------------------------------------------
  updateAnnouncement: adminPortalProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(200).optional(),
        body: z.string().min(1).optional(),
        urgency: z.enum(["info", "warning", "high", "critical"]).optional(),
        audience: z.enum(["all", "roles"]).optional(),
        targetRoles: z.array(z.string()).optional(),
        expiresAt: z.coerce.date().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.announcement.update({
        where: { id },
        data,
      });
    }),

  // -------------------------------------------------------------------------
  // deleteAnnouncement — admin only
  // -------------------------------------------------------------------------
  deleteAnnouncement: adminPortalProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.announcement.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
