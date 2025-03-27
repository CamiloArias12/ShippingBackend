import { AppDataSource } from "./data-source";
import { MigrationDataSource } from "./migration-config";

export async function setupDatabase(options: { migrate?: boolean, seed?: boolean } = {}) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    if (options.migrate) {
      const migrationDataSource = MigrationDataSource;
      if (!migrationDataSource.isInitialized) {
        await migrationDataSource.initialize();
      }

      const pendingMigrations = await migrationDataSource.showMigrations();
      if (pendingMigrations) {
        await migrationDataSource.runMigrations();
      } else {
      }

      await migrationDataSource.destroy();
    }
    return true;
  } catch (error) {
    throw error;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    migrate: args.includes('migrate'),
    seed: args.includes('seed')
  };

  setupDatabase(options)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      process.exit(1);
    });
}