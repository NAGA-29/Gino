import { z } from "zod";
import { ScopeSchema, StatusSchema } from "./enums";

export const DashboardSchema = z.object({
  total: z.number().int(),
  byScope: z.record(ScopeSchema, z.number().int()),
  byStatus: z.record(StatusSchema, z.number().int()),
  projectCount: z.number().int(),
  recentChanges: z.array(
    z.object({
      instructionId: z.string(),
      name: z.string(),
      displayName: z.string(),
      version: z.string(),
      changeSummary: z.string(),
      createdAt: z.string(),
    }),
  ),
});
export type Dashboard = z.infer<typeof DashboardSchema>;
