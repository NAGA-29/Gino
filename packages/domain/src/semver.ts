import type { InstructionContent } from "@air/schema";

export interface SemVer {
  major: number;
  minor: number;
  patch: number;
  prerelease: string;
}

export type BumpKind = "major" | "minor" | "patch";

export function parseSemver(input: string): SemVer | null {
  const m = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(input.trim());
  if (!m) return null;
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    prerelease: m[4] ?? "",
  };
}

/** SemVerとして比較する。解釈できない値は文字列比較にフォールバックする。 */
export function compareSemver(a: string, b: string): number {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (!pa || !pb) return a.localeCompare(b);
  for (const key of ["major", "minor", "patch"] as const) {
    if (pa[key] !== pb[key]) return pa[key] - pb[key];
  }
  // prerelease なしの方が新しい
  if (pa.prerelease === pb.prerelease) return 0;
  if (!pa.prerelease) return 1;
  if (!pb.prerelease) return -1;
  return pa.prerelease.localeCompare(pb.prerelease, undefined, { numeric: true });
}

export function bumpVersion(version: string, kind: BumpKind): string {
  const v = parseSemver(version) ?? { major: 0, minor: 0, patch: 0, prerelease: "" };
  switch (kind) {
    case "major":
      return `${v.major + 1}.0.0`;
    case "minor":
      return `${v.major}.${v.minor + 1}.0`;
    case "patch":
      return `${v.major}.${v.minor}.${v.patch + 1}`;
  }
}

const sameList = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

/**
 * 変更内容から推奨Bumpを返す (設計書 §14)。強制はせず、UIのヒントとして使う。
 * - Activation Rule の変更 / Instructionの削除 → major
 * - Instruction・タグの追加 → minor
 * - それ以外の文章修正 → patch
 * - 変更なし → null
 */
export function suggestBump(prev: InstructionContent, next: InstructionContent): BumpKind | null {
  const a = prev.activation;
  const b = next.activation;
  const activationChanged =
    !sameList(a.when, b.when) ||
    !sameList(a.whenNot, b.whenNot) ||
    !sameList(a.requiredContext, b.requiredContext) ||
    !sameList(a.preferredContext, b.preferredContext);
  if (activationChanged) return "major";

  const removed = prev.instructions.some((i) => !next.instructions.includes(i));
  const added = next.instructions.some((i) => !prev.instructions.includes(i));
  // 文言修正 (同数で入れ替わり) は patch とみなす
  if (removed && next.instructions.length < prev.instructions.length) return "major";
  if (added && next.instructions.length > prev.instructions.length) return "minor";

  const tagsAdded = next.tags.some((t) => !prev.tags.includes(t));
  if (tagsAdded) return "minor";

  if (
    removed ||
    added ||
    !sameList(prev.instructions, next.instructions) ||
    !sameList(prev.tags, next.tags) ||
    prev.body !== next.body
  ) {
    return "patch";
  }
  return null;
}
