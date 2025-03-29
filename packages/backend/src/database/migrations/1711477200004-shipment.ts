import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateRouteTable1711477200004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "shipment",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "weight",
            type: "float",
            isNullable: false,
          },
          {
            name: "dimensions",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "user_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "driver_id",
            type: "int",
            isNullable: true,
          },
          {
            name: "destination",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "in_transit", "delivered", "cancelled"],
            isNullable: true,
          },
          {
            name: "route_id",
            type: "int",
            isNullable: true
          },
          {
            name: "latitude",
            type: "float",
            isNullable: true
          },
          {
            name: "longitude",
            type: "float",
            isNullable: true
          },
          {
            name: "product_type",
            type: "varchar",
            isNullable: true
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      "shipment",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "user",
        onDelete: "CASCADE",
      })
    );
    await queryRunner.createForeignKey("shipment", new TableForeignKey({
      columnNames: ["route_id"],
      referencedColumnNames: ["id"],
      referencedTableName: "route",
      onDelete: "CASCADE"
    }));

    await queryRunner.createForeignKey(
      "shipment",
      new TableForeignKey({
        columnNames: ["driver_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "driver",
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("route");

    const userForeignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("user_id") !== -1
    );
    if (userForeignKey) {
      await queryRunner.dropForeignKey("route", userForeignKey);
    }

    const driverForeignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("driver_id") !== -1
    );
    if (driverForeignKey) {
      await queryRunner.dropForeignKey("route", driverForeignKey);
    }

    await queryRunner.dropTable("route");
  }
}