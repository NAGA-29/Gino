import { z } from "zod";
import { IdSchema } from "./common";
import { ExportFormatSchema } from "./enums";

/**
 * POST /exports
 * instructionIds か projectId のどちらか (または両方) を指定する。
 * projectId を指定した場合は Project Profile の構成順 (General → Personal → Project → ...) で出力する。
 */
export const ExportRequestSchema = z
  .object({
    instructionIds: z.array(IdSchema).default([]),
    projectId: IdSchema.optional(),
    format: ExportFormatSchema.default("markdown"),
  })
  .refine((v) => v.instructionIds.length > 0 || v.projectId, {
    message: "instructionIds または projectId を指定してください",
  });
export type ExportRequest = z.input<typeof ExportRequestSchema>;

export const ExportResultSchema = z.object({
  format: ExportFormatSchema,
  filename: z.string(),
  mimeType: z.string(),
  content: z.string(),
});
export type ExportResult = z.infer<typeof ExportResultSchema>;
