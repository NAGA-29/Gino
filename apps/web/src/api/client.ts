import { API_BASE_PATH, type ApiErrorBody } from "@air/shared";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody | null,
  ) {
    super(body?.error.message ?? `Request failed (${status})`);
  }

  /** zod flatten() 形式の fieldErrors を1行にまとめる */
  get detailMessage(): string {
    const details = this.body?.error.details as { fieldErrors?: Record<string, string[]> } | undefined;
    const fields = details?.fieldErrors;
    if (!fields) return this.message;
    const parts = Object.entries(fields).map(([k, v]) => `${k}: ${v.join(", ")}`);
    return parts.length ? `${this.message} (${parts.join(" / ")})` : this.message;
  }
}

export async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_PATH}${path}`, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    let parsed: ApiErrorBody | null = null;
    try {
      parsed = (await res.json()) as ApiErrorBody;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, parsed);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const qs = (params: Record<string, string | undefined | null>) => {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) s.set(k, v);
  const str = s.toString();
  return str ? `?${str}` : "";
};
