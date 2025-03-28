import mysql from 'mysql2/promise';
import { DriverStatus } from 'src/domain/entities/Driver';
import { Driver } from 'typeorm';

export class DriverRepository {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async findById(id: number): Promise<Driver | null> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM driver WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    const drivers = rows as Driver[];
    return drivers.length ? drivers[0] : null;
  }

  async findAvailableDrivers(): Promise<Driver[]> {
    const [rows] = await this.connection.execute(
      `SELECT * FROM driver WHERE status = ? AND deleted_at IS NULL`,
      [DriverStatus.AVAILABLE]
    );
    return rows as Driver[];
  }

  async updateDriverStatus(driverId: number, status: DriverStatus): Promise<void> {
    await this.connection.execute(
      `UPDATE driver SET status = ? WHERE id = ?`,
      [status, driverId]
    );
  }
}