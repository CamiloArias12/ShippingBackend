import { AppDataSource } from "./data-source";
import { MigrationDataSource } from "./migration-config";

export async function setupDatabase(options: { migrate?: boolean, seed?: boolean } = {}) {
  try {
    // Initialize TypeORM connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // If migrate option is set, run migrations
    if (options.migrate) {
      
      // Initialize migration data source
      const migrationDataSource = MigrationDataSource;
      if (!migrationDataSource.isInitialized) {
        await migrationDataSource.initialize();
      }
      
      // Run pending migrations
      const pendingMigrations = await migrationDataSource.showMigrations();
      if (pendingMigrations) {
        await migrationDataSource.runMigrations();
      } else {
      }
      
      // Close the migration data source
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