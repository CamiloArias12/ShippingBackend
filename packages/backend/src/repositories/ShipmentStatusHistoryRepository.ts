import mysql from 'mysql2/promise';
import { ShipmentStatusHistory } from '../domain/entities/ShipmentStatusHistory';
import { Logger } from '../utils/Logger';

export class ShipmentStatusHistoryRepository {
    private db: mysql.Connection;
    private logger: Logger;

    constructor(db: mysql.Connection, logger: Logger) {
        this.db = db;
        this.logger = logger;
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

        try {
            const [result] = await this.db.execute<mysql.ResultSetHeader>(query, values);
            return { ...history, id: result.insertId };
        } catch (error) {
            this.logger.error('[ShipmentStatusHistoryRepository](create) Error creating shipment status history:', error);
            throw error;
        }
    }

    async findByShipmentId(shipmentId: number): Promise<ShipmentStatusHistory[]> {
        const query = `
      SELECT * FROM shipment_status_history
      WHERE shipment_id = ? AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
        try {
            const [rows] = await this.db.execute(query, [shipmentId]);
            return rows as ShipmentStatusHistory[];
        } catch (error) {
            this.logger.error('[ShipmentStatusHistoryRepository](findByShipmentId) Error finding shipment status history by shipment ID:', error);
            throw error;
        }
    }
}