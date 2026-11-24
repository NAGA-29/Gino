import type { ExportFormat } from "@air/schema";
import { MarkdownExporter } from "./markdown";
import type { Exporter } from "./types";

export * from "./types";
export { MarkdownExporter, renderItem } from "./markdown";

const registry = new Map<ExportFormat, Exporter>([["markdown", new MarkdownExporter()]]);

export function getExporter(format: ExportFormat): Exporter {
  const exporter = registry.get(format);
  if (!exporter) throw new Error(`Unsupported export format: ${format}`);
  return exporter;
}

export function listExporters(): Array<{ format: ExportFormat; label: string }> {
  return [...registry.values()].map((e) => ({ format: e.format, label: e.label }));
}
