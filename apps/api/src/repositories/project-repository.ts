import { and, asc, eq, sql } from "drizzle-orm";
import type { Project, ProjectSummary } from "@air/schema";
import type { Database } from "../db/client";
import { projectInstructions, projects } from "../db/schema";
import { toProject } from "./serialize";

export class ProjectRepository {
  constructor(private readonly db: Database) {}

  async list(): Promise<ProjectSummary[]> {
    const rows = await this.db
      .select({
        project: projects,
        instructionCount: sql<number>`(select count(*)::int from ${projectInstructions} pi where pi.project_id = ${projects.id})`,
      })
      .from(projects)
      .orderBy(asc(projects.name));
    return rows.map((r) => ({ ...toProject(r.project), instructionCount: r.instructionCount }));
  }

  async findById(id: string): Promise<Project | null> {
    const [row] = await this.db.select().from(projects).where(eq(projects.id, id));
    return row ? toProject(row) : null;
  }

  async create(input: { name: string; description: string }): Promise<Project> {
    const [row] = await this.db.insert(projects).values(input).returning();
    return toProject(row!);
  }

  async update(id: string, patch: { name?: string; description?: string }): Promise<Project | null> {
    const [row] = await this.db
      .update(projects)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return row ? toProject(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
    return rows.length > 0;
  }

  async count(): Promise<number> {
    const [row] = await this.db.select({ n: sql<number>`count(*)::int` }).from(projects);
    return row?.n ?? 0;
  }

  async listLinks(projectId: string) {
    return this.db.select().from(projectInstructions).where(eq(projectInstructions.projectId, projectId));
  }

  async upsertLink(projectId: string, link: { instructionId: string; enabled: boolean; priority: number }) {
    await this.db
      .insert(projectInstructions)
      .values({ projectId, ...link })
      .onConflictDoUpdate({
        target: [projectInstructions.projectId, projectInstructions.instructionId],
        set: { enabled: link.enabled, priority: link.priority },
      });
    await this.touch(projectId);
  }

  async deleteLink(projectId: string, instructionId: string): Promise<boolean> {
    const rows = await this.db
      .delete(projectInstructions)
      .where(and(eq(projectInstructions.projectId, projectId), eq(projectInstructions.instructionId, instructionId)))
      .returning({ id: projectInstructions.instructionId });
    if (rows.length) await this.touch(projectId);
    return rows.length > 0;
  }

  private async touch(projectId: string) {
    await this.db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, projectId));
  }
}
