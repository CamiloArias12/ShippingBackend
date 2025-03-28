import { DataSource } from 'typeorm';
import { config } from '../config';

export const MigrationDataSource = new DataSource({
  type: "mysql",
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.password,
  database: config.db.name,
  migrations: ["src/database/migrations/*.ts"],
  logging: true
});