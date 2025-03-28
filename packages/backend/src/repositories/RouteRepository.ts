import mysql from 'mysql2/promise';
import { Route } from 'src/domain/entities/Route';

export class RouteRepository {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async create(route: Route): Promise<Route> {
    const query = `
      INSERT INTO route (name, origin, destination, distance, estimated_time)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [route.name, route.origin, route.destination, route.distance, route.estimated_time];
    const [result] = await this.connection.execute<mysql.ResultSetHeader>(query, values);
    return { ...route, id: result.insertId };
  }

  async findById(id: number): Promise<Route | null> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM route WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    const routes = rows as Route[];
    return routes.length ? routes[0] : null;
  }

  async findAll(): Promise<Route[]> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM route WHERE deleted_at IS NULL'
    );
    return rows as Route[];
  }
}