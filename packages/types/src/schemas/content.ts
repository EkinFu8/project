import { z } from "zod";

export const contentIdSchema = z.object({
  id: z.string().uuid(),
});

export const createContentSchema = z.object({
  title: z.string().min(1).max(500),
  body: z.string().min(1),
  status: z.enum(["draft", "published"]).default("draft"),
  employee_id: z.string().uuid().nullish(),
});

export const updateContentSchema = createContentSchema.partial();

export const contentListQuerySchema = z.object({
  status: z.enum(["draft", "published"]).optional(),
  employee_id: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type ContentId = z.infer<typeof contentIdSchema>;
export type CreateContent = z.infer<typeof createContentSchema>;
export type UpdateContent = z.infer<typeof updateContentSchema>;
export type ContentListQuery = z.infer<typeof contentListQuerySchema>;
