import type { ExportFormat, ExportResult, InstructionContent, Scope, Status } from "@air/schema";

/** Exporterに渡す、Canonical Instruction の1件 */
export interface ExportItem {
  name: string;
  displayName: string;
  description: string;
  scope: Scope;
  status: Status;
  version: string;
  content: InstructionContent;
}

export interface ExportInput {
  /** Project Profile からのExportの場合のProject情報 */
  project?: { name: string; description: string };
  items: ExportItem[];
  /** 出力に埋め込む生成日時 (テストで固定するため注入可能) */
  generatedAt?: Date;
}

/**
 * Canonical Instruction → 各AI向け形式 への変換器 (設計書 §17)。
 * MVPでは MarkdownExporter のみ。OpenAI Skill / CLAUDE.md / Cursor Rules / AGENTS.md は
 * 必要性が確認できたらこのインターフェースを実装して追加する。
 */
export interface Exporter {
  readonly format: ExportFormat;
  readonly label: string;
  export(input: ExportInput): ExportResult;
}
