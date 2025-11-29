import { FileMigrationProvider, Migrator } from "kysely";
import * as path from "@std/path";
import { createDb } from "./db/client.ts";

async function runMigrations() {
  const db = createDb();
  const isDown = Deno.args.includes("--down");

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs: {
        readdir: async (dirPath) => {
          const entries: string[] = [];
          for await (const entry of Deno.readDir(dirPath)) {
            entries.push(entry.name);
          }
          return entries;
        },
      },
      path: {
        join: path.join,
      },
      migrationFolder: new URL("./db/migrations", import.meta.url).pathname,
    }),
  });

  if (isDown) {
    const { error, results } = await migrator.migrateDown();
    results?.forEach((it) => {
      console.log(`↓ ${it.migrationName}: ${it.status}`);
    });
    if (error) throw error;
  } else {
    const { error, results } = await migrator.migrateToLatest();
    results?.forEach((it) => {
      console.log(`↑ ${it.migrationName}: ${it.status}`);
    });
    if (error) throw error;
  }

  await db.destroy();
}

runMigrations();

