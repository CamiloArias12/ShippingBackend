import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class InitialMigration1711477200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "user",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "username",
                    type: "varchar",
                    length: "255",
                    isUnique: true
                },
                {
                    name: "email",
                    type: "varchar",
                    length: "255",
                    isUnique: true
                },
                {
                    name: "password",
                    type: "varchar",
                    length: "255"
                },
                {
                    name: "role",
                    type: "enum",
                    enum: ["admin", "user", "driver"],
                    default: "'user'"
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Add email index
        await queryRunner.createIndex("user", new TableIndex({
            name: "idx_users_email",
            columnNames: ["email"]
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order
        await queryRunner.dropTable("orders");
        await queryRunner.dropTable("user");
    }
}