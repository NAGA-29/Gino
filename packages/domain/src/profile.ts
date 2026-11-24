import type { Scope } from "@air/schema";
import { compareBy } from "@air/shared";

/**
 * Project Profile の合成順 (設計書 §12)
 *   General + Personal + Project + Task Specific
 * organization は general と personal の間、experimental は最後に置く。
 */
export const SCOPE_LAYER_ORDER: readonly Scope[] = ["general", "organization", "personal", "project", "experimental"];

export interface ProfileEntry {
  scope: Scope;
  name: string;
  enabled: boolean;
  priority: number;
}

/**
 * 有効なInstructionを、スコープレイヤー順 → priority降順 → name昇順で並べる。
 */
export function composeProfile<T extends ProfileEntry>(entries: readonly T[]): T[] {
  return entries
    .filter((e) => e.enabled)
    .slice()
    .sort(
      compareBy<T>(
        (a, b) => SCOPE_LAYER_ORDER.indexOf(a.scope) - SCOPE_LAYER_ORDER.indexOf(b.scope),
        (a, b) => b.priority - a.priority,
        (a, b) => a.name.localeCompare(b.name),
      ),
    );
}

/** スコープごとにグループ化する (SCOPE_LAYER_ORDER順) */
export function groupByScope<T extends { scope: Scope }>(entries: readonly T[]): Array<{ scope: Scope; items: T[] }> {
  return SCOPE_LAYER_ORDER.map((scope) => ({ scope, items: entries.filter((e) => e.scope === scope) })).filter(
    (g) => g.items.length > 0,
  );
}
