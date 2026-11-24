import {
  CreateInstructionInputSchema,
  CreateVersionInputSchema,
  UpdateInstructionInputSchema,
  type CreateInstructionInput,
  type CreateVersionInput,
  type DiffResult,
  type InstructionListQuery,
  type UpdateInstructionInput,
} from "@air/schema";
import { compareSemver, diffContents, metaSection } from "@air/domain";
import { conflict, isUniqueViolation, notFound } from "../errors";
import type { InstructionRepository } from "../repositories/instruction-repository";

export class InstructionService {
  constructor(private readonly repo: InstructionRepository) {}

  list(query: InstructionListQuery) {
    return this.repo.list(query);
  }

  async get(id: string) {
    const found = await this.repo.findById(id);
    if (!found) throw notFound("Instruction");
    return found;
  }

  async create(input: CreateInstructionInput) {
    const { version, content, changeSummary, ...meta } = CreateInstructionInputSchema.parse(input);
    try {
      return await this.repo.create(meta, { version, content, changeSummary });
    } catch (err) {
      if (isUniqueViolation(err)) throw conflict(`Instruction "${meta.name}" already exists`);
      throw err;
    }
  }

  async update(id: string, input: UpdateInstructionInput) {
    const patch = UpdateInstructionInputSchema.parse(input);
    try {
      const updated = await this.repo.updateMeta(id, patch);
      if (!updated) throw notFound("Instruction");
      return updated;
    } catch (err) {
      if (isUniqueViolation(err)) throw conflict(`Instruction "${patch.name}" already exists`);
      throw err;
    }
  }

  async delete(id: string) {
    if (!(await this.repo.delete(id))) throw notFound("Instruction");
  }

  async listVersions(id: string) {
    await this.get(id);
    const versions = await this.repo.listVersions(id);
    return versions.sort((a, b) => compareSemver(b.version, a.version));
  }

  async getVersion(id: string, version: string) {
    await this.get(id);
    const found = await this.repo.findVersion(id, version.replace(/^v/i, ""));
    if (!found) throw notFound(`Version ${version}`);
    return found;
  }

  /**
   * 新Versionを作成し current にする。
   * MVPではSemVerのbumpルールは強制しない (設計書 §14) が、同一番号の重複は許可しない。
   */
  async createVersion(id: string, input: CreateVersionInput) {
    const parsed = CreateVersionInputSchema.parse(input);
    await this.get(id);
    try {
      return await this.repo.createVersion(id, parsed);
    } catch (err) {
      if (isUniqueViolation(err)) throw conflict(`Version ${parsed.version} already exists`);
      throw err;
    }
  }

  async diff(id: string, from: string, to: string): Promise<DiffResult & { meta: string }> {
    const instruction = await this.get(id);
    const [a, b] = await Promise.all([this.getVersion(id, from), this.getVersion(id, to)]);
    return { ...diffContents(a, b), meta: metaSection(instruction) };
  }
}
