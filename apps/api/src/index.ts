import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { createDb } from "./db/client";
import { env } from "./env";

const { db, close } = createDb(env.databaseUrl);
const app = createApp({ db, corsOrigin: env.corsOrigin, log: true });

const server = serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`AI Instruction Registry API listening on http://localhost:${info.port}`);
});

const shutdown = () => {
  server.close();
  void close().finally(() => process.exit(0));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
