import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateShipmentAssignmentTable1711477200005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "shipment_assignment",
      columns: [
        {
          name: "id",
          type: "int",
          isPrimary: true,
          isGenerated: true,
          generationStrategy: "increment",
        },
        { name: "shipment_id", type: "int" },
        { name: "route_id", type: "int" },
        { name: "driver_id", type: "int" },
        { name: "status", type: "enum", enum: ["assigned", "in_progress", "completed", "cancelled"], default: "'assigned'" },
        { name: "assigned_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        { name: "completed_at", type: "timestamp", isNullable: true },
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
    
    // Clave foránea para shipment_id
    await queryRunner.createForeignKey("shipment_assignment", new TableForeignKey({
      columnNames: ["shipment_id"],
      referencedColumnNames: ["id"],
      referencedTableName: "shipment",
      onDelete: "CASCADE"
    }));
    
    // Clave foránea para route_id
    await queryRunner.createForeignKey("shipment_assignment", new TableForeignKey({
      columnNames: ["route_id"],
      referencedColumnNames: ["id"],
      referencedTableName: "route",
      onDelete: "CASCADE"
    }));
    
    // Clave foránea para driver_id
    await queryRunner.createForeignKey("shipment_assignment", new TableForeignKey({
      columnNames: ["driver_id"],
      referencedColumnNames: ["id"],
      referencedTableName: "driver",
      onDelete: "CASCADE"
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("shipment_assignment");
  }
}