import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateShipmentStatusHistoryTable1711477200005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "shipment_status_history",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "shipment_id",
            type: "varchar", // Cambiado de varchar a int para referenciar shipment.id
            isNullable: false,
          },
          {
            name: "previous_status",
            type: "enum",
            enum: ["pending", "in_transit", "delivered", "cancelled"],
            isNullable: true,
          },
          {
            name: "new_status",
            type: "enum",
            enum: ["pending", "in_transit", "delivered", "cancelled"],
            isNullable: false,
          },
          {
            name: "changed_by_user_id",
            type: "int",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
          },
        ],
      })
    );

    // Crear clave foránea para `shipment_id` apuntando a `shipment.id`
    await queryRunner.createForeignKey(
      "shipment_status_history",
      new TableForeignKey({
        columnNames: ["shipment_id"],
        referencedColumnNames: ["id"], // Apunta a shipment.id
        referencedTableName: "shipment",
        onDelete: "CASCADE",
      })
    );

    // Crear clave foránea para `changed_by_user_id` apuntando a `user.id`
    await queryRunner.createForeignKey(
      "shipment_status_history",
      new TableForeignKey({
        columnNames: ["changed_by_user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "user",
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("shipment_status_history");

    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey("shipment_status_history", foreignKey);
      }
    }

    await queryRunner.dropTable("shipment_status_history");
  }
}