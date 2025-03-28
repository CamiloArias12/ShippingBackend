import mysql from 'mysql2/promise';
import { ShipmentAssignment, ShipmentAssignmentStatus } from 'src/domain/entities/ShipmentAssignment';

export class ShipmentAssignmentRepository {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async create(assignment: ShipmentAssignment): Promise<ShipmentAssignment> {
    const query = `
      INSERT INTO shipment_assignment (shipment_id, route_id, driver_id, status, assigned_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      assignment.shipment_id, 
      assignment.route_id, 
      assignment.driver_id, 
      assignment.status || ShipmentAssignmentStatus.ASSIGNED,
      assignment.assigned_at || new Date()
    ];
    const [result] = await this.connection.execute<mysql.ResultSetHeader>(query, values);
    return { ...assignment, id: result.insertId, status: ShipmentAssignmentStatus.ASSIGNED };
  }

  async findByShipmentId(shipmentId: number): Promise<ShipmentAssignment | null> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM shipment_assignment WHERE shipment_id = ? AND deleted_at IS NULL',
      [shipmentId]
    );
    const assignments = rows as ShipmentAssignment[];
    return assignments.length ? assignments[0] : null;
  }

  async findByDriverId(driverId: number): Promise<ShipmentAssignment[]> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM shipment_assignment WHERE driver_id = ? AND status IN (?, ?) AND deleted_at IS NULL',
      [driverId, ShipmentAssignmentStatus.ASSIGNED, ShipmentAssignmentStatus.IN_PROGRESS]
    );
    return rows as ShipmentAssignment[];
  }

  async updateStatus(id: number, status: ShipmentAssignmentStatus): Promise<void> {
    const query = `UPDATE shipment_assignment SET status = ? WHERE id = ?`;
    await this.connection.execute(query, [status, id]);
    
    if (status === ShipmentAssignmentStatus.COMPLETED) {
      await this.connection.execute(
        `UPDATE shipment_assignment SET completed_at = NOW() WHERE id = ?`, 
        [id]
      );
    }
  }
  
  async findAllWithDetails(): Promise<any[]> {
    const query = `
      SELECT sa.*, s.weight, s.dimensions, s.product_type, s.destination, 
             r.name as route_name, r.origin, r.destination as route_destination, r.estimated_time,
             u.name as driver_name
      FROM shipment_assignment sa
      JOIN shipment s ON sa.shipment_id = s.id
      JOIN route r ON sa.route_id = r.id
      JOIN driver d ON sa.driver_id = d.id
      JOIN user u ON d.user_id = u.id
      WHERE sa.deleted_at IS NULL
      ORDER BY sa.created_at DESC
    `;
    const [rows] = await this.connection.execute(query);
    return rows as any[];
  }
}