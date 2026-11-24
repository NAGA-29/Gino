import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { env } from "../env";
import { createDb, type Database } from "./client";

export const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));

export async function runMigrations(db: Database): Promise<void> {
  await migrate(db, { migrationsFolder });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { db, close } = createDb(env.databaseUrl);
  await runMigrations(db);
  await close();
  console.log("migrations applied");
}
