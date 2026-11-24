import { sql } from "drizzle-orm";
import { afterAll, beforeEach } from "vitest";
import { createApp } from "../src/app";
import { createDb } from "../src/db/client";

/** テスト用App。各テスト前に全テーブルをTRUNCATEする。 */
export function setupTestApp() {
  const { db, close } = createDb(process.env.DATABASE_URL!);
  const app = createApp({ db });

  beforeEach(async () => {
    await db.execute(sql`truncate table project_instructions, projects, instruction_versions, instructions cascade`);
  });
  afterAll(async () => {
    await close();
  });

  const request = async (method: string, path: string, body?: unknown) => {
    const res = await app.request(`/api/v1${path}`, {
      method,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json: any = text ? JSON.parse(text) : null;
    return { status: res.status, json };
  };

  return { app, db, request };
}
