import type { InstructionContent } from "@air/schema";

export interface InstructionMetaLike {
  name: string;
  displayName: string;
  description: string;
  scope: string;
  status: string;
}

const list = (key: string, items: readonly string[], indent = ""): string[] =>
  items.length === 0 ? [`${indent}${key}: []`] : [`${indent}${key}:`, ...items.map((i) => `${indent}  - ${i}`)];

/**
 * 差分表示用に Instruction Content を決定的なテキスト (YAML風) に変換する。
 * セクションごとに分けて返すことで、セクション別Diffに利用できる。
 */
export function contentSections(content: InstructionContent): Record<"activation" | "instructions" | "body" | "tags", string> {
  const a = content.activation;
  return {
    activation: [
      "activation:",
      ...list("when", a.when, "  "),
      ...list("when_not", a.whenNot, "  "),
      ...list("required_context", a.requiredContext, "  "),
      ...list("preferred_context", a.preferredContext, "  "),
    ].join("\n"),
    instructions: list("instructions", content.instructions).join("\n"),
    body: content.body ? ["body: |", ...content.body.split("\n").map((l) => `  ${l}`)].join("\n") : "body: \"\"",
    tags: list("tags", content.tags).join("\n"),
  };
}

export function metaSection(meta: InstructionMetaLike): string {
  return [
    `name: ${meta.name}`,
    `display_name: ${meta.displayName}`,
    `description: ${meta.description}`,
    `scope: ${meta.scope}`,
    `status: ${meta.status}`,
  ].join("\n");
}

export function contentToText(content: InstructionContent): string {
  const s = contentSections(content);
  return [s.activation, s.instructions, s.body, s.tags].join("\n\n") + "\n";
}
