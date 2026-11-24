import { ExportRequestSchema, type ExportRequest, type ExportResult, type InstructionDetail } from "@air/schema";
import { getExporter, listExporters, type ExportItem } from "@air/exporters";
import { notFound } from "../errors";
import type { InstructionRepository } from "../repositories/instruction-repository";
import type { ProjectService } from "./project-service";

const toItem = (i: InstructionDetail): ExportItem | null =>
  i.currentVersion
    ? {
        name: i.name,
        displayName: i.displayName,
        description: i.description,
        scope: i.scope,
        status: i.status,
        version: i.currentVersion.version,
        content: i.currentVersion.content,
      }
    : null;

export class ExportService {
  constructor(
    private readonly instructions: InstructionRepository,
    private readonly projects: ProjectService,
  ) {}

  formats() {
    return listExporters();
  }

  /**
   * CanonicalなInstructionから指定形式を生成する (設計書 §16)。
   * - projectId: Project Profile の有効なInstructionを構成順で出力
   * - instructionIds: 指定順で出力 (projectId と併用時は Profile の後ろに追加)
   */
  async export(input: ExportRequest): Promise<ExportResult> {
    const req = ExportRequestSchema.parse(input);
    const ordered: InstructionDetail[] = [];
    let project: { name: string; description: string } | undefined;

    if (req.projectId) {
      const p = await this.projects.get(req.projectId);
      project = { name: p.name, description: p.description };
      const profile = await this.projects.listInstructions(req.projectId);
      ordered.push(...profile.filter((pi) => pi.enabled).map((pi) => pi.instruction));
    }

    if (req.instructionIds.length) {
      const found = await this.instructions.findManyByIds(req.instructionIds);
      const byId = new Map(found.map((i) => [i.id, i]));
      const missing = req.instructionIds.filter((id) => !byId.has(id));
      if (missing.length) throw notFound(`Instruction(s) ${missing.join(", ")}`);
      const seen = new Set(ordered.map((i) => i.id));
      for (const id of req.instructionIds) {
        if (!seen.has(id)) {
          ordered.push(byId.get(id)!);
          seen.add(id);
        }
      }
    }

    const items = ordered.map(toItem).filter((i): i is ExportItem => i !== null);
    return getExporter(req.format).export({ project, items });
  }
}
