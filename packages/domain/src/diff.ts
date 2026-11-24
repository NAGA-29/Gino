import { createTwoFilesPatch, structuredPatch } from "diff";
import type { DiffResult, DiffSection, InstructionContent } from "@air/schema";
import { contentSections, contentToText } from "./canonical";

function unified(label: string, fromName: string, toName: string, a: string, b: string): string {
  if (a === b) return "";
  const patch = createTwoFilesPatch(`${label}@${fromName}`, `${label}@${toName}`, ensureNl(a), ensureNl(b), "", "", {
    context: 3,
  });
  // 先頭の "=====" 区切り行を除く
  return patch.replace(/^=+\n/, "");
}

const ensureNl = (s: string) => (s.endsWith("\n") ? s : `${s}\n`);

function countChanges(a: string, b: string) {
  const p = structuredPatch("a", "b", ensureNl(a), ensureNl(b), "", "", { context: 0 });
  let additions = 0;
  let deletions = 0;
  for (const h of p.hunks) {
    for (const line of h.lines) {
      if (line.startsWith("+")) additions++;
      else if (line.startsWith("-")) deletions++;
    }
  }
  return { additions, deletions };
}

/** 2つのVersionの差分を計算する (設計書 §15) */
export function diffContents(
  from: { version: string; content: InstructionContent },
  to: { version: string; content: InstructionContent },
): DiffResult {
  const fromText = contentToText(from.content);
  const toText = contentToText(to.content);
  const fs = contentSections(from.content);
  const ts = contentSections(to.content);

  const sections: DiffSection[] = (["activation", "instructions", "body", "tags"] as const).map((section) => ({
    section,
    changed: fs[section] !== ts[section],
    unified: unified(section, from.version, to.version, fs[section], ts[section]),
  }));

  return {
    from: from.version,
    to: to.version,
    unified: unified("instruction", from.version, to.version, fromText, toText),
    sections,
    stats: countChanges(fromText, toText),
  };
}
