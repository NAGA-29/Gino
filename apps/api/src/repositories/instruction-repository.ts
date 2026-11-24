import { and, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import type { InstructionContent, InstructionDetail, InstructionListQuery, Scope, Status } from "@air/schema";
import type { Database } from "../db/client";
import { instructionVersions, instructions, projectInstructions } from "../db/schema";
import { toInstructionDetail, toVersion } from "./serialize";

const withRelations = {
  currentVersion: true,
  projectLinks: { with: { project: { columns: { id: true, name: true } } } },
} as const;

export interface InstructionMetaRow {
  name: string;
  displayName: string;
  description: string;
  scope: Scope;
  status: Status;
}

/** Transaction内でも同じ操作ができるよう、Database互換の型を受け付ける */
type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];
type Executor = Database | Tx;

export class InstructionRepository {
  constructor(private readonly db: Database) {}

  async list(query: InstructionListQuery = {}): Promise<InstructionDetail[]> {
    const filters: SQL[] = [];
    if (query.scope) filters.push(eq(instructions.scope, query.scope));
    if (query.status) filters.push(eq(instructions.status, query.status));
    if (query.q) {
      const like = `%${query.q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
      filters.push(
        or(
          ilike(instructions.name, like),
          ilike(instructions.displayName, like),
          ilike(instructions.description, like),
        )!,
      );
    }
    if (query.tag) {
      filters.push(
        sql`exists (select 1 from ${instructionVersions} v where v.id = ${instructions.currentVersionId} and v.content -> 'tags' ? ${query.tag})`,
      );
    }
    if (query.projectId) {
      filters.push(
        sql`exists (select 1 from ${projectInstructions} pi where pi.instruction_id = ${instructions.id} and pi.project_id = ${query.projectId})`,
      );
    }

    const rows = await this.db.query.instructions.findMany({
      where: filters.length ? and(...filters) : undefined,
      with: withRelations,
      orderBy: [desc(instructions.updatedAt), instructions.name],
    });
    return rows.map(toInstructionDetail);
  }

  async findById(id: string, ex: Executor = this.db): Promise<InstructionDetail | null> {
    const row = await ex.query.instructions.findFirst({ where: eq(instructions.id, id), with: withRelations });
    return row ? toInstructionDetail(row) : null;
  }

  async findManyByIds(ids: string[]): Promise<InstructionDetail[]> {
    if (ids.length === 0) return [];
    const rows = await this.db.query.instructions.findMany({
      where: inArray(instructions.id, ids),
      with: withRelations,
    });
    return rows.map(toInstructionDetail);
  }

  async create(
    meta: InstructionMetaRow,
    initial: { version: string; content: InstructionContent; changeSummary: string },
  ): Promise<InstructionDetail> {
    return this.db.transaction(async (tx) => {
      const [created] = await tx.insert(instructions).values(meta).returning({ id: instructions.id });
      const id = created!.id;
      await this.insertVersion(tx, id, initial);
      return (await this.findById(id, tx))!;
    });
  }

  async updateMeta(id: string, patch: Partial<InstructionMetaRow>): Promise<InstructionDetail | null> {
    const updated = await this.db
      .update(instructions)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(instructions.id, id))
      .returning({ id: instructions.id });
    if (updated.length === 0) return null;
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db.delete(instructions).where(eq(instructions.id, id)).returning({ id: instructions.id });
    return deleted.length > 0;
  }

  async listVersions(instructionId: string) {
    const rows = await this.db
      .select()
      .from(instructionVersions)
      .where(eq(instructionVersions.instructionId, instructionId))
      .orderBy(desc(instructionVersions.createdAt));
    return rows.map(toVersion);
  }

  async findVersion(instructionId: string, version: string) {
    const [row] = await this.db
      .select()
      .from(instructionVersions)
      .where(and(eq(instructionVersions.instructionId, instructionId), eq(instructionVersions.version, version)));
    return row ? toVersion(row) : null;
  }

  async createVersion(instructionId: string, input: { version: string; content: InstructionContent; changeSummary: string }) {
    return this.db.transaction(async (tx) => this.insertVersion(tx, instructionId, input));
  }

  private async insertVersion(
    tx: Executor,
    instructionId: string,
    input: { version: string; content: InstructionContent; changeSummary: string },
  ) {
    const [row] = await tx
      .insert(instructionVersions)
      .values({ instructionId, ...input })
      .returning();
    await tx
      .update(instructions)
      .set({ currentVersionId: row!.id, updatedAt: new Date() })
      .where(eq(instructions.id, instructionId));
    return toVersion(row!);
  }

  /** 最近の変更 (Dashboard用) */
  async recentVersions(limit: number) {
    return this.db
      .select({
        instructionId: instructions.id,
        name: instructions.name,
        displayName: instructions.displayName,
        version: instructionVersions.version,
        changeSummary: instructionVersions.changeSummary,
        createdAt: instructionVersions.createdAt,
      })
      .from(instructionVersions)
      .innerJoin(instructions, eq(instructions.id, instructionVersions.instructionId))
      .orderBy(desc(instructionVersions.createdAt))
      .limit(limit);
  }

  async countBy(column: "scope" | "status") {
    const col = column === "scope" ? instructions.scope : instructions.status;
    return this.db
      .select({ key: col, count: sql<number>`count(*)::int` })
      .from(instructions)
      .groupBy(col);
  }
}

