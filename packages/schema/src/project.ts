import { z } from "zod";
import { IdSchema, TimestampSchema } from "./common";
import { InstructionDetailSchema } from "./instruction";

export const ProjectSchema = z.object({
  id: IdSchema,
  name: z.string(),
  description: z.string(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type Project = z.infer<typeof ProjectSchema>;

export const ProjectSummarySchema = ProjectSchema.extend({
  instructionCount: z.number().int(),
});
export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;

export const CreateProjectInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).default(""),
});
export type CreateProjectInput = z.input<typeof CreateProjectInputSchema>;

export const UpdateProjectInputSchema = CreateProjectInputSchema.partial();
export type UpdateProjectInput = z.input<typeof UpdateProjectInputSchema>;

/** project_instructions の1行 */
export const ProjectInstructionLinkInputSchema = z.object({
  instructionId: IdSchema,
  enabled: z.boolean().default(true),
  priority: z.number().int().min(-1000).max(1000).default(0),
});
export type ProjectInstructionLinkInput = z.input<typeof ProjectInstructionLinkInputSchema>;

export const ProjectInstructionSchema = z.object({
  projectId: IdSchema,
  enabled: z.boolean(),
  priority: z.number().int(),
  instruction: InstructionDetailSchema,
});
export type ProjectInstruction = z.infer<typeof ProjectInstructionSchema>;
