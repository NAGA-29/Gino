import { z } from "zod";
import { IdSchema, SlugSchema, StringListSchema, TagListSchema, TimestampSchema, VersionStringSchema } from "./common";
import { ScopeSchema, StatusSchema } from "./enums";

/** Activation Rule (設計書 §11): いつ使うべきか */
export const ActivationSchema = z.object({
  when: StringListSchema,
  whenNot: StringListSchema,
  requiredContext: StringListSchema,
  preferredContext: StringListSchema,
});
export type Activation = z.infer<typeof ActivationSchema>;

/**
 * Versionごとに保存される本体 (instruction_versions.content, JSONB)。
 * - instructions: 箇条書きのルール
 * - body: 補足のMarkdown本文 (任意)
 */
export const InstructionContentSchema = z.object({
  activation: ActivationSchema.default({}),
  instructions: StringListSchema,
  body: z.string().default(""),
  tags: TagListSchema,
});
export type InstructionContent = z.infer<typeof InstructionContentSchema>;
export type InstructionContentInput = z.input<typeof InstructionContentSchema>;

export const emptyContent = (): InstructionContent => InstructionContentSchema.parse({});

export const InstructionVersionSchema = z.object({
  id: IdSchema,
  instructionId: IdSchema,
  version: z.string(),
  content: InstructionContentSchema,
  changeSummary: z.string(),
  createdAt: TimestampSchema,
});
export type InstructionVersion = z.infer<typeof InstructionVersionSchema>;

export const InstructionSchema = z.object({
  id: IdSchema,
  name: SlugSchema,
  displayName: z.string(),
  description: z.string(),
  scope: ScopeSchema,
  status: StatusSchema,
  currentVersionId: IdSchema.nullable(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type Instruction = z.infer<typeof InstructionSchema>;

/** 一覧・詳細で返す、現行Versionと紐付くProjectを含む形 */
export const InstructionDetailSchema = InstructionSchema.extend({
  currentVersion: InstructionVersionSchema.nullable(),
  projects: z.array(z.object({ id: IdSchema, name: z.string() })),
});
export type InstructionDetail = z.infer<typeof InstructionDetailSchema>;

export const InstructionMetaInputSchema = z.object({
  name: SlugSchema,
  displayName: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).default(""),
  scope: ScopeSchema.default("general"),
  status: StatusSchema.default("draft"),
});

export const CreateInstructionInputSchema = InstructionMetaInputSchema.extend({
  version: VersionStringSchema.default("1.0.0"),
  content: InstructionContentSchema.default({}),
  changeSummary: z.string().trim().max(2000).default("Initial version"),
});
export type CreateInstructionInput = z.input<typeof CreateInstructionInputSchema>;

/** メタデータのみ更新する (本文の更新は新Versionとして作成する) */
export const UpdateInstructionInputSchema = InstructionMetaInputSchema.partial();
export type UpdateInstructionInput = z.input<typeof UpdateInstructionInputSchema>;

export const CreateVersionInputSchema = z.object({
  version: VersionStringSchema,
  content: InstructionContentSchema,
  changeSummary: z.string().trim().max(2000).default(""),
});
export type CreateVersionInput = z.input<typeof CreateVersionInputSchema>;

export const InstructionListQuerySchema = z.object({
  q: z.string().trim().optional(),
  tag: z.string().trim().toLowerCase().optional(),
  scope: ScopeSchema.optional(),
  status: StatusSchema.optional(),
  projectId: IdSchema.optional(),
});
export type InstructionListQuery = z.infer<typeof InstructionListQuerySchema>;

export const DiffQuerySchema = z.object({
  from: VersionStringSchema,
  to: VersionStringSchema,
});
