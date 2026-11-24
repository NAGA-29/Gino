import { z } from "zod";

/** kebab-case 識別子 (例: api-design-review) */
export const SlugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case (a-z, 0-9, -) で入力してください");

/**
 * SemVer形式のバージョン文字列。先頭の "v" は取り除いて正規化する。
 * MVPでは bump ルールの強制はせず、形式のみ検証する (設計書 §14)。
 */
export const VersionStringSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/^v/i, ""))
  .pipe(
    z
      .string()
      .regex(
        /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/,
        "SemVer形式 (例: 1.2.0) で入力してください",
      ),
  );

export const IdSchema = z.string().uuid();

export const TimestampSchema = z.string().datetime({ offset: true });

/** 空文字・重複を取り除いた文字列リスト */
const uniqueTrimmed = (list: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const item = raw.trim();
    if (item && !seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out;
};

export const StringListSchema = z.array(z.string()).default([]).transform(uniqueTrimmed);

/** 小文字化した上で重複排除するタグリスト */
export const TagListSchema = z
  .array(z.string())
  .default([])
  .transform((list) => uniqueTrimmed(list.map((t) => t.toLowerCase())));
