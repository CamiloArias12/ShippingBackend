import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateDriverTable1711477200003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "driver",
      columns: [
        {
          name: "id",
          type: "int",
          isPrimary: true,
          isGenerated: true,
          generationStrategy: "increment",
        },
        { name: "user_id", type: "int" },
        { name: "license", type: "varchar", length: "50" },
        { name: "vehicle_type", type: "varchar", length: "100" },
        { name: "vehicle_capacity", type: "decimal", precision: 10, scale: 2 },
        { name: "status", type: "enum", enum: ["available", "busy", "offline"], default: "'available'" },
        {
          name: "created_at",
          type: "timestamp",
          default: "CURRENT_TIMESTAMP"
        },
        {
          name: "updated_at",
          type: "timestamp",
          default: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        },
        {
          name: "deleted_at",
          type: "timestamp",
          isNullable: true
        }
      ]
    }));
    await queryRunner.createForeignKey("driver", new TableForeignKey({
      columnNames: ["user_id"],
      referencedColumnNames: ["id"],
      referencedTableName: "user",
      onDelete: "CASCADE"
    }));
    await queryRunner.createIndex("driver", new TableIndex({
      name: "idx_driver_status",
      columnNames: ["status"],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("driver");
  }
}