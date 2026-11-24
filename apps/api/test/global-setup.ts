import { createDb } from "../src/db/client";
import { runMigrations } from "../src/db/migrate";

export default async function setup() {
  const url = process.env.TEST_DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/registry_test";
  const { db, close } = createDb(url);
  await runMigrations(db);
  await close();
}
