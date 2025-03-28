import mysql from 'mysql2/promise';
import { ShipmentStatusHistory } from '../domain/entities/ShipmentStatusHistory';
export class ShipmentStatusHistoryRepository {
    private connection: mysql.Connection;

    constructor(connection: mysql.Connection) {
        this.connection = connection;
    }

    async create(history: ShipmentStatusHistory): Promise<ShipmentStatusHistory> {
        const query = `
      INSERT INTO shipment_status_history 
      (shipment_id, previous_status, new_status, changed_by_user_id,created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
        const values = [
            history.shipment_id,
            history.previous_status || null,
            history.new_status,
            history.changed_by_user_id || null,
            history.created_at,
        ];

        const [result] = await this.connection.execute<mysql.ResultSetHeader>(query, values);
        return { ...history, id: result.insertId };
    }

    async findByShipmentId(shipmentId: number): Promise<ShipmentStatusHistory[]> {
        const query = `
      SELECT * FROM shipment_status_history
      WHERE shipment_id = ? AND deleted_at IS NULL
      ORDER BY changed_at DESC
    `;
        const [rows] = await this.connection.execute(query, [shipmentId]);
        return rows as ShipmentStatusHistory[];
    }
}