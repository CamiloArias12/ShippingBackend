import mysql from 'mysql2/promise';
import { Route } from 'src/domain/entities/Route';
import { Logger } from '../utils/Logger';

export class RouteRepository {
    private db: mysql.Connection;
    private logger: Logger;

    constructor(db: mysql.Connection, logger: Logger) {
        this.logger = logger;
        this.db = db;
    }

    async findById(id: number): Promise<Route | null> {
        try {
            const [rows] = await this.db.execute(
                'SELECT * FROM route WHERE id = ? AND deleted_at IS NULL',
                [id]
            );
            const routes = rows as Route[];
            return routes.length ? routes[0] : null;
        } catch (error) {
            this.logger.error(`[RouteRepository](findById) Error finding route by ID ${id}:`, error);
            throw error;
        }
    }

    async findAll(): Promise<Route[]> {
        try {
            const [rows] = await this.db.execute(
                'SELECT * FROM route WHERE deleted_at IS NULL'
            );
            return rows as Route[];
        } catch (error) {
            this.logger.error('[RouteRepository](findAll) Error finding all routes:', error);
            throw error;
        }
    }
}