import mysql from 'mysql2/promise';
import { Shipment, ShipmentStatus } from '../domain/entities/Shipment';

export class ShipmentRepository {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async create(shipment: Shipment): Promise<Shipment> {
    const query = `
      INSERT INTO shipment (weight, dimensions, product_type, destination, status, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      shipment.weight,
      shipment.dimensions,
      shipment.product_type,
      shipment.destination,
      shipment.status || ShipmentStatus.PENDING
    ];
    const [result] = await this.connection.execute<mysql.ResultSetHeader>(query, values);
    const insertedId = result.insertId;
    return { ...shipment, id: insertedId, status: ShipmentStatus.PENDING };
  }

    async findById(id: number): Promise<Shipment | null> {
        const query = 'SELECT * FROM shipment WHERE id = ? AND deleted_at IS NULL';
        const [rows] = await this.connection.execute(query, [id]);
        return rows[0] as Shipment | null;
    }
}