import {
  CreateProjectInputSchema,
  ProjectInstructionLinkInputSchema,
  UpdateProjectInputSchema,
  type CreateProjectInput,
  type ProjectInstruction,
  type ProjectInstructionLinkInput,
  type UpdateProjectInput,
} from "@air/schema";
import { SCOPE_LAYER_ORDER } from "@air/domain";
import { compareBy } from "@air/shared";
import { conflict, isUniqueViolation, notFound } from "../errors";
import type { InstructionRepository } from "../repositories/instruction-repository";
import type { ProjectRepository } from "../repositories/project-repository";

export class ProjectService {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly instructions: InstructionRepository,
  ) {}

  list() {
    return this.projects.list();
  }

  async get(id: string) {
    const found = await this.projects.findById(id);
    if (!found) throw notFound("Project");
    return found;
  }

  async create(input: CreateProjectInput) {
    const parsed = CreateProjectInputSchema.parse(input);
    try {
      return await this.projects.create(parsed);
    } catch (err) {
      if (isUniqueViolation(err)) throw conflict(`Project "${parsed.name}" already exists`);
      throw err;
    }
  }

  async update(id: string, input: UpdateProjectInput) {
    const parsed = UpdateProjectInputSchema.parse(input);
    try {
      const updated = await this.projects.update(id, parsed);
      if (!updated) throw notFound("Project");
      return updated;
    } catch (err) {
      if (isUniqueViolation(err)) throw conflict(`Project "${parsed.name}" already exists`);
      throw err;
    }
  }

  async delete(id: string) {
    if (!(await this.projects.delete(id))) throw notFound("Project");
  }

  /**
   * Project Profile (設計書 §12)。
   * General → Organization → Personal → Project → Experimental の順、同レイヤー内は priority 降順。
   * 無効化されたものも返す (enabled=false)。
   */
  async listInstructions(projectId: string): Promise<ProjectInstruction[]> {
    await this.get(projectId);
    const links = await this.projects.listLinks(projectId);
    const details = await this.instructions.findManyByIds(links.map((l) => l.instructionId));
    const byId = new Map(details.map((d) => [d.id, d]));
    return links
      .flatMap((l) => {
        const instruction = byId.get(l.instructionId);
        return instruction ? [{ projectId, enabled: l.enabled, priority: l.priority, instruction }] : [];
      })
      .sort(
        compareBy<ProjectInstruction>(
          (a, b) => SCOPE_LAYER_ORDER.indexOf(a.instruction.scope) - SCOPE_LAYER_ORDER.indexOf(b.instruction.scope),
          (a, b) => b.priority - a.priority,
          (a, b) => a.instruction.name.localeCompare(b.instruction.name),
        ),
      );
  }

  /** 紐付けを追加 (既存なら enabled / priority を更新) */
  async linkInstruction(projectId: string, input: ProjectInstructionLinkInput) {
    const link = ProjectInstructionLinkInputSchema.parse(input);
    await this.get(projectId);
    if (!(await this.instructions.findById(link.instructionId))) throw notFound("Instruction");
    await this.projects.upsertLink(projectId, link);
    return this.listInstructions(projectId);
  }

  async unlinkInstruction(projectId: string, instructionId: string) {
    await this.get(projectId);
    if (!(await this.projects.deleteLink(projectId, instructionId))) throw notFound("Project instruction link");
  }
}
