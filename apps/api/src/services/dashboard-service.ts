import { SCOPES, STATUSES, type Dashboard, type Scope, type Status } from "@air/schema";
import type { InstructionRepository } from "../repositories/instruction-repository";
import type { ProjectRepository } from "../repositories/project-repository";

export class DashboardService {
  constructor(
    private readonly instructions: InstructionRepository,
    private readonly projects: ProjectRepository,
  ) {}

  async get(): Promise<Dashboard> {
    const [scopeRows, statusRows, recent, projectCount] = await Promise.all([
      this.instructions.countBy("scope"),
      this.instructions.countBy("status"),
      this.instructions.recentVersions(10),
      this.projects.count(),
    ]);
    const byScope = Object.fromEntries(SCOPES.map((s) => [s, 0])) as Record<Scope, number>;
    for (const r of scopeRows) byScope[r.key as Scope] = r.count;
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
    for (const r of statusRows) byStatus[r.key as Status] = r.count;

    return {
      total: Object.values(byScope).reduce((a, b) => a + b, 0),
      byScope,
      byStatus,
      projectCount,
      recentChanges: recent.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    };
  }
}
