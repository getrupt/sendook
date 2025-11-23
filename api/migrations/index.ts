import { readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Migration from "../db/mongo/schemas/Migration";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MigrationModule {
  runMigration: () => Promise<void>;
}

async function getMigrationFiles(): Promise<string[]> {
  const migrationsDir = __dirname;
  const files = await readdir(migrationsDir);
  
  return files
    .filter((file) => file.endsWith(".ts") && file !== "index.ts")
    .sort();
}

async function getCompletedMigrations(): Promise<Set<string>> {
  const completed = await Migration.find({ status: "completed" });
  return new Set(completed.map((m) => m.filename));
}

async function recordMigrationStart(filename: string, path: string): Promise<void> {
  await Migration.findOneAndUpdate(
    { filename },
    {
      filename,
      path,
      status: "running",
      error: null,
    },
    { upsert: true, new: true }
  );
}

async function recordMigrationSuccess(filename: string): Promise<void> {
  await Migration.findOneAndUpdate(
    { filename },
    {
      status: "completed",
      error: null,
    }
  );
}

async function recordMigrationError(filename: string, error: string): Promise<void> {
  await Migration.findOneAndUpdate(
    { filename },
    {
      status: "failed",
      error: error.substring(0, 1000),
    }
  );
}

async function runMigrations(): Promise<void> {
  console.log("Starting migration runner...");

  try {
    const migrationFiles = await getMigrationFiles();
    console.log(`Found ${migrationFiles.length} migration file(s)`);

    if (migrationFiles.length === 0) {
      console.log("No migrations to run.");
      return;
    }

    const completedMigrations = await getCompletedMigrations();
    console.log(`Found ${completedMigrations.size} completed migration(s)`);

    const pendingMigrations = migrationFiles.filter(
      (file) => !completedMigrations.has(file)
    );

    if (pendingMigrations.length === 0) {
      console.log("All migrations have already been completed.");
      return;
    }

    console.log(`Running ${pendingMigrations.length} pending migration(s)...`);

    for (const filename of pendingMigrations) {
      const migrationPath = join(__dirname, filename);
      console.log(`\n--- Running migration: ${filename} ---`);

      try {
        await recordMigrationStart(filename, migrationPath);

        const migrationModule = (await import(
          `./${filename}`
        )) as MigrationModule;

        if (!migrationModule.runMigration) {
          throw new Error(
            `Migration ${filename} does not export a runMigration function`
          );
        }

        await migrationModule.runMigration();

        await recordMigrationSuccess(filename);
        console.log(`✓ Migration ${filename} completed successfully`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`✗ Migration ${filename} failed:`, errorMessage);

        await recordMigrationError(filename, errorMessage);

        console.log(`Continuing with next migration...`);
      }
    }

    console.log("\n=== Migration Runner Summary ===");
    const allMigrations = await Migration.find({
      filename: { $in: migrationFiles },
    });

    const completed = allMigrations.filter((m) => m.status === "completed");
    const failed = allMigrations.filter((m) => m.status === "failed");
    const running = allMigrations.filter((m) => m.status === "running");

    console.log(`Total migrations: ${migrationFiles.length}`);
    console.log(`Completed: ${completed.length}`);
    console.log(`Failed: ${failed.length}`);
    if (running.length > 0) {
      console.log(`Running: ${running.length}`);
    }

    if (failed.length > 0) {
      console.log("\nFailed migrations:");
      failed.forEach((m) => {
        console.log(`  - ${m.filename}: ${m.error}`);
      });
    }

    console.log("\nMigration runner finished.");
  } catch (error) {
    console.error("Migration runner error:", error);
    throw error;
  }
}

export default runMigrations;

