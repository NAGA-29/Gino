import { z } from "zod";

export const DiffSectionSchema = z.object({
  section: z.enum(["metadata", "activation", "instructions", "body", "tags"]),
  changed: z.boolean(),
  unified: z.string(),
});
export type DiffSection = z.infer<typeof DiffSectionSchema>;

export const DiffResultSchema = z.object({
  from: z.string(),
  to: z.string(),
  /** 全体のunified diff */
  unified: z.string(),
  sections: z.array(DiffSectionSchema),
  stats: z.object({ additions: z.number().int(), deletions: z.number().int() }),
});
export type DiffResult = z.infer<typeof DiffResultSchema>;
