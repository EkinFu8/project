import { adminPortalProcedure, router } from "../lib/trpc";

const contentCurrencyStaleAfterDays = 180;
const dueSoonDays = 30;

type ReportOwner = {
  id: string;
  name: string;
  employee_code: string | null;
  role: string;
} | null;

type ContentStatusCounts = {
  created: number;
  inProgress: number;
  finalized: number;
  archived: number;
  other: number;
};

type CurrencyCounts = ContentStatusCounts & {
  total: number;
  current: number;
  stale: number;
  missingLastModified: number;
};

type DateCounts = {
  total: number;
  expired: number;
  expiringSoon: number;
  futureExpiration: number;
  missingExpirationDate: number;
  reviewOverdue: number;
  reviewDueSoon: number;
  futureReview: number;
  missingReviewDate: number;
};

type DueDateState = "missing" | "overdue" | "due-soon" | "future";

type AttentionDocument = {
  fileID: string;
  filename: string | null;
  owner: ReportOwner;
  role: string;
  document_status: string | null;
  expiration_date: Date | null;
  next_review_date: Date | null;
  expirationState: DueDateState;
  reviewState: DueDateState;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function ownerKey(owner: ReportOwner) {
  return owner?.id ?? "unassigned";
}

function roleLabel(...roles: Array<string | null | undefined>) {
  for (const role of roles) {
    const normalized = role?.trim();
    if (normalized) return normalized;
  }

  return "unassigned";
}

function contentRole(document: { job_position: string | null; owner: ReportOwner }) {
  return roleLabel(document.job_position, document.owner?.role);
}

function blankStatusCounts(): ContentStatusCounts {
  return {
    created: 0,
    inProgress: 0,
    finalized: 0,
    archived: 0,
    other: 0,
  };
}

function blankCurrencyCounts(): CurrencyCounts {
  return {
    total: 0,
    current: 0,
    stale: 0,
    missingLastModified: 0,
    ...blankStatusCounts(),
  };
}

function blankDateCounts(): DateCounts {
  return {
    total: 0,
    expired: 0,
    expiringSoon: 0,
    futureExpiration: 0,
    missingExpirationDate: 0,
    reviewOverdue: 0,
    reviewDueSoon: 0,
    futureReview: 0,
    missingReviewDate: 0,
  };
}

function incrementStatus(counts: ContentStatusCounts, status?: string | null) {
  switch (status) {
    case "Created":
      counts.created += 1;
      break;
    case "in-progress":
      counts.inProgress += 1;
      break;
    case "Finalized":
      counts.finalized += 1;
      break;
    case "Archived":
      counts.archived += 1;
      break;
    default:
      counts.other += 1;
      break;
  }
}

function dateState(date: Date | null, today: Date, dueSoonThrough: Date): DueDateState {
  if (!date) return "missing";
  if (date < today) return "overdue";
  if (date <= dueSoonThrough) return "due-soon";
  return "future";
}

export const metricsRouter = router({
  /**
   * OVERVIEW
   */
  getOverview: adminPortalProcedure.query(async ({ ctx }) => {
    const [totalRequests, errors, activeUsers] = await Promise.all([
      ctx.prisma.metricsEvent.count(),
      ctx.prisma.metricsEvent.count({
        where: { status: "ERROR" },
      }),
      ctx.prisma.metricsEvent.findMany({
        select: { userId: true },
        distinct: ["userId"],
      }),
    ]);

    const errorRate = totalRequests === 0 ? 0 : errors / totalRequests;

    return {
      totalRequests,
      errors,
      activeUsers: activeUsers.length,
      errorRate,
    };
  }),

  /**
   * RECENT ACTIVITY
   */
  getRecent: adminPortalProcedure.query(async ({ ctx }) => {
    return ctx.prisma.metricsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }),

  /**
   * SLOW ROUTES (optimized grouping)
   */
  getSlowestRoutes: adminPortalProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.metricsEvent.findMany({
      select: {
        route: true,
        durationMs: true,
      },
    });

    const grouped = new Map<string, { total: number; count: number }>();

    for (const d of data) {
      if (!grouped.has(d.route)) {
        grouped.set(d.route, { total: 0, count: 0 });
      }

      const entry = grouped.get(d.route)!;
      entry.total += d.durationMs;
      entry.count += 1;
    }

    return Array.from(grouped.entries()).map(([route, v]) => ({
      route,
      avgDuration: v.total / v.count,
    }));
  }),

  getActiveUsers: adminPortalProcedure.query(async ({ ctx }) => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    return ctx.prisma.userSession.findMany({
      where: {
        lastSeen: { gte: fiveMinAgo },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }),

  getPerformance: adminPortalProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.metricsEvent.findMany();

    const grouped = new Map<string, number[]>();

    for (const d of data) {
      if (!grouped.has(d.route)) grouped.set(d.route, []);
      grouped.get(d.route)!.push(d.durationMs);
    }

    return Array.from(grouped.entries()).map(([route, times]) => ({
      route,
      avgDuration: times.reduce((a, b) => a + b, 0) / times.length,
    }));
  }),

  /**
   * CONTENT CURRENCY REPORT
   *
   * Current/stale status is based on last modified date. Items without a last
   * modified date are tracked separately so they do not appear current.
   */
  getContentCurrencyReport: adminPortalProcedure.query(async ({ ctx }) => {
    const staleCutoff = addDays(startOfToday(), -contentCurrencyStaleAfterDays);
    const documents = await ctx.prisma.contentManagement.findMany({
      select: {
        fileID: true,
        filename: true,
        job_position: true,
        last_modified: true,
        document_status: true,
        owner: {
          select: {
            id: true,
            name: true,
            employee_code: true,
            role: true,
          },
        },
      },
    });

    const totals = blankCurrencyCounts();
    const byOwnerRole = new Map<
      string,
      {
        owner: ReportOwner;
        role: string;
        counts: CurrencyCounts;
        oldestLastModifiedAt: Date | null;
        newestLastModifiedAt: Date | null;
      }
    >();
    const byRole = new Map<
      string,
      {
        role: string;
        counts: CurrencyCounts;
        ownerIds: Set<string>;
        oldestLastModifiedAt: Date | null;
        newestLastModifiedAt: Date | null;
      }
    >();

    for (const document of documents) {
      const owner = document.owner ?? null;
      const role = contentRole({ job_position: document.job_position, owner });
      const key = `${ownerKey(owner)}:${role}`;

      if (!byOwnerRole.has(key)) {
        byOwnerRole.set(key, {
          owner,
          role,
          counts: blankCurrencyCounts(),
          oldestLastModifiedAt: null,
          newestLastModifiedAt: null,
        });
      }

      if (!byRole.has(role)) {
        byRole.set(role, {
          role,
          counts: blankCurrencyCounts(),
          ownerIds: new Set<string>(),
          oldestLastModifiedAt: null,
          newestLastModifiedAt: null,
        });
      }

      const ownerEntry = byOwnerRole.get(key)!;
      const roleEntry = byRole.get(role)!;
      const entries = [totals, ownerEntry.counts, roleEntry.counts];

      for (const counts of entries) {
        counts.total += 1;
        incrementStatus(counts, document.document_status);

        if (!document.last_modified) {
          counts.missingLastModified += 1;
        } else if (document.last_modified < staleCutoff) {
          counts.stale += 1;
        } else {
          counts.current += 1;
        }
      }

      roleEntry.ownerIds.add(ownerKey(owner));

      if (document.last_modified) {
        for (const entry of [ownerEntry, roleEntry]) {
          if (!entry.oldestLastModifiedAt || document.last_modified < entry.oldestLastModifiedAt) {
            entry.oldestLastModifiedAt = document.last_modified;
          }

          if (!entry.newestLastModifiedAt || document.last_modified > entry.newestLastModifiedAt) {
            entry.newestLastModifiedAt = document.last_modified;
          }
        }
      }
    }

    return {
      generatedAt: new Date(),
      staleAfterDays: contentCurrencyStaleAfterDays,
      staleCutoff,
      totals,
      byOwner: Array.from(byOwnerRole.values())
        .map((entry) => ({
          owner: entry.owner,
          role: entry.role,
          ...entry.counts,
          oldestLastModifiedAt: entry.oldestLastModifiedAt,
          newestLastModifiedAt: entry.newestLastModifiedAt,
        }))
        .sort((a, b) => b.total - a.total),
      byRole: Array.from(byRole.values())
        .map((entry) => ({
          role: entry.role,
          ...entry.counts,
          owners: entry.ownerIds.size,
          oldestLastModifiedAt: entry.oldestLastModifiedAt,
          newestLastModifiedAt: entry.newestLastModifiedAt,
        }))
        .sort((a, b) => b.total - a.total),
    };
  }),

  /**
   * EXPIRATION / REVIEW DATE REPORT
   */
  getExpirationReviewReport: adminPortalProcedure.query(async ({ ctx }) => {
    const today = startOfToday();
    const dueSoonThrough = addDays(today, dueSoonDays);
    const documents = await ctx.prisma.contentManagement.findMany({
      select: {
        fileID: true,
        filename: true,
        job_position: true,
        expiration_date: true,
        next_review_date: true,
        document_status: true,
        owner: {
          select: {
            id: true,
            name: true,
            employee_code: true,
            role: true,
          },
        },
      },
      orderBy: [{ expiration_date: "asc" }, { next_review_date: "asc" }],
    });

    const totals = blankDateCounts();
    const byOwnerRole = new Map<
      string,
      {
        owner: ReportOwner;
        role: string;
        counts: DateCounts;
        nextExpirationDate: Date | null;
        nextReviewDate: Date | null;
      }
    >();
    const byRole = new Map<
      string,
      {
        role: string;
        counts: DateCounts;
        ownerIds: Set<string>;
        nextExpirationDate: Date | null;
        nextReviewDate: Date | null;
      }
    >();
    const attentionDocuments: AttentionDocument[] = [];

    for (const document of documents) {
      const owner = document.owner ?? null;
      const role = contentRole({ job_position: document.job_position, owner });
      const key = `${ownerKey(owner)}:${role}`;
      const expirationState = dateState(document.expiration_date, today, dueSoonThrough);
      const reviewState = dateState(document.next_review_date, today, dueSoonThrough);

      if (!byOwnerRole.has(key)) {
        byOwnerRole.set(key, {
          owner,
          role,
          counts: blankDateCounts(),
          nextExpirationDate: null,
          nextReviewDate: null,
        });
      }

      if (!byRole.has(role)) {
        byRole.set(role, {
          role,
          counts: blankDateCounts(),
          ownerIds: new Set<string>(),
          nextExpirationDate: null,
          nextReviewDate: null,
        });
      }

      const ownerEntry = byOwnerRole.get(key)!;
      const roleEntry = byRole.get(role)!;

      for (const counts of [totals, ownerEntry.counts, roleEntry.counts]) {
        counts.total += 1;

        if (expirationState === "missing") counts.missingExpirationDate += 1;
        if (expirationState === "overdue") counts.expired += 1;
        if (expirationState === "due-soon") counts.expiringSoon += 1;
        if (expirationState === "future") counts.futureExpiration += 1;

        if (reviewState === "missing") counts.missingReviewDate += 1;
        if (reviewState === "overdue") counts.reviewOverdue += 1;
        if (reviewState === "due-soon") counts.reviewDueSoon += 1;
        if (reviewState === "future") counts.futureReview += 1;
      }

      roleEntry.ownerIds.add(ownerKey(owner));

      if (document.expiration_date && document.expiration_date >= today) {
        for (const entry of [ownerEntry, roleEntry]) {
          if (!entry.nextExpirationDate || document.expiration_date < entry.nextExpirationDate) {
            entry.nextExpirationDate = document.expiration_date;
          }
        }
      }

      if (document.next_review_date && document.next_review_date >= today) {
        for (const entry of [ownerEntry, roleEntry]) {
          if (!entry.nextReviewDate || document.next_review_date < entry.nextReviewDate) {
            entry.nextReviewDate = document.next_review_date;
          }
        }
      }

      if (
        expirationState === "overdue" ||
        expirationState === "due-soon" ||
        reviewState === "overdue" ||
        reviewState === "due-soon"
      ) {
        attentionDocuments.push({
          fileID: document.fileID,
          filename: document.filename,
          owner,
          role,
          document_status: document.document_status,
          expiration_date: document.expiration_date,
          next_review_date: document.next_review_date,
          expirationState,
          reviewState,
        });
      }
    }

    return {
      generatedAt: new Date(),
      dueSoonDays,
      today,
      dueSoonThrough,
      totals,
      byOwner: Array.from(byOwnerRole.values())
        .map((entry) => ({
          owner: entry.owner,
          role: entry.role,
          ...entry.counts,
          nextExpirationDate: entry.nextExpirationDate,
          nextReviewDate: entry.nextReviewDate,
        }))
        .sort((a, b) => b.expired + b.reviewOverdue - (a.expired + a.reviewOverdue)),
      byRole: Array.from(byRole.values())
        .map((entry) => ({
          role: entry.role,
          ...entry.counts,
          owners: entry.ownerIds.size,
          nextExpirationDate: entry.nextExpirationDate,
          nextReviewDate: entry.nextReviewDate,
        }))
        .sort((a, b) => b.expired + b.reviewOverdue - (a.expired + a.reviewOverdue)),
      attentionDocuments,
    };
  }),
});
