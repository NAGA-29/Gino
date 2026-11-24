import { z } from "zod";

/** Instructionの適用範囲 (設計書 §9) */
export const SCOPES = ["general", "personal", "project", "organization", "experimental"] as const;
export const ScopeSchema = z.enum(SCOPES);
export type Scope = z.infer<typeof ScopeSchema>;

/** Lifecycle (設計書 §13) */
export const STATUSES = ["draft", "review", "published", "deprecated", "archived"] as const;
export const StatusSchema = z.enum(STATUSES);
export type Status = z.infer<typeof StatusSchema>;

/** Export Format (設計書 §16)。MVPはmarkdownのみ。 */
export const EXPORT_FORMATS = ["markdown"] as const;
export const ExportFormatSchema = z.enum(EXPORT_FORMATS);
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
