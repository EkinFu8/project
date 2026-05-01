import type { RouterOutputs } from "@/lib/trpc";

export type NotificationItem = RouterOutputs["notifications"]["myList"]["items"][number];

export type FilterKey =
  | "all"
  | "unread"
  | "pinned"
  | "announcements"
  | "urgent"
  | "documents"
  | "ownership";
