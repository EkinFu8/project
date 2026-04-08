import { z } from "zod";
import { userIdSchema } from "./user";

export const directoryEntryIdSchema = userIdSchema;

export const directoryListQuerySchema = z.object({
  search: z.string().optional(),
  /** Same employee-portal directory, excludes signed-in user (for “coworkers” list). */
  coworkersOnly: z.boolean().optional(),
  /** Only `portal === employee` profiles (e.g. content owner picker); includes self. */
  employeePortalOnly: z.boolean().optional(),
});

export type DirectoryEntryId = z.infer<typeof directoryEntryIdSchema>;
export type DirectoryListQuery = z.infer<typeof directoryListQuerySchema>;
