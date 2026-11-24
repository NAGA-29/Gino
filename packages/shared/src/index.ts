/** API エラーレスポンスの共通形 */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export const API_BASE_PATH = "/api/v1";

export function assertNever(value: never, message = "Unexpected value"): never {
  throw new Error(`${message}: ${String(value)}`);
}

/** 安定ソート用の比較関数を合成する */
export function compareBy<T>(...comparators: Array<(a: T, b: T) => number>) {
  return (a: T, b: T): number => {
    for (const cmp of comparators) {
      const r = cmp(a, b);
      if (r !== 0) return r;
    }
    return 0;
  };
}
