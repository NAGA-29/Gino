import type { InstructionContent, InstructionDetail, InstructionVersion, Project } from "@air/schema";
import { InstructionContentSchema } from "@air/schema";
import type { instructionVersions, instructions, projects } from "../db/schema";

type InstructionRow = typeof instructions.$inferSelect;
type VersionRow = typeof instructionVersions.$inferSelect;
type ProjectRow = typeof projects.$inferSelect;

const iso = (d: Date) => d.toISOString();

/** 古いデータでも欠けたフィールドを補完して返す */
const normalizeContent = (c: unknown): InstructionContent => InstructionContentSchema.parse(c ?? {});

export function toVersion(row: VersionRow): InstructionVersion {
  return {
    id: row.id,
    instructionId: row.instructionId,
    version: row.version,
    content: normalizeContent(row.content),
    changeSummary: row.changeSummary,
    createdAt: iso(row.createdAt),
  };
}

export function toInstructionDetail(
  row: InstructionRow & {
    currentVersion: VersionRow | null;
    projectLinks: Array<{ project: Pick<ProjectRow, "id" | "name"> }>;
  },
): InstructionDetail {
  return {
    id: row.id,
    name: row.name,
    displayName: row.displayName,
    description: row.description,
    scope: row.scope,
    status: row.status,
    currentVersionId: row.currentVersionId,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
    currentVersion: row.currentVersion ? toVersion(row.currentVersion) : null,
    projects: row.projectLinks
      .map((l) => ({ id: l.project.id, name: l.project.name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}
