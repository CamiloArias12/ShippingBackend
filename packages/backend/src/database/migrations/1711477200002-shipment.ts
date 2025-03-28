import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateRouteTable1711477200002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "route",
      columns: [
        {
          name: "id",
          type: "int",
          isPrimary: true,
          isGenerated: true,
          generationStrategy: "increment",
        },
        { name: "name", type: "varchar", length: "255" },
        { name: "origin", type: "varchar", length: "255" },
        { name: "destination", type: "varchar", length: "255" },
        { name: "distance", type: "decimal", precision: 10, scale: 2 },
        { name: "estimated_time", type: "int" }, // minutes
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
    await queryRunner.createIndex("route", new TableIndex({
      name: "idx_route_name",
      columnNames: ["name"],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("route");
  }
}