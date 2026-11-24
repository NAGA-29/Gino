import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { API_BASE_PATH, type ApiErrorBody } from "@air/shared";
import type { Database } from "./db/client";
import { AppError } from "./errors";

export interface AppOptions {
  db: Database;
  corsOrigin?: string[];
  log?: boolean;
}

export function createApp({ db, corsOrigin = [], log = false }: AppOptions) {
  const api = new Hono();

  api.get("/health", (c) => c.json({ ok: true }));

  const app = new Hono();
  if (log) app.use(logger());
  if (corsOrigin.length) app.use("/api/*", cors({ origin: corsOrigin }));

  app.route(API_BASE_PATH, api);

  app.notFound((c) => c.json<ApiErrorBody>({ error: { code: "NOT_FOUND", message: "Route not found" } }, 404));
  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json<ApiErrorBody>(
        { error: { code: err.code, message: err.message, details: err.details } },
        err.status,
      );
    }
    console.error(err);
    return c.json<ApiErrorBody>({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, 500);
  });

  // db は後続のルート登録で利用する
  void db;
  return app;
}

export type App = ReturnType<typeof createApp>;
