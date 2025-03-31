import mysql from 'mysql2/promise';
import { Shipment } from '../domain/entities/Shipment';
import { ShipmentStatus } from '@shipping/shared/dist/enums';
import { Logger } from '../utils/Logger';

export class ShipmentRepository {
    private db: mysql.Connection;
    private logger: Logger;

    constructor(db: mysql.Connection, logger: Logger) {
        this.logger = logger;
        this.db = db;
    }

    async create(shipment: Shipment): Promise<Shipment> {
        const query = `
            INSERT INTO shipment (id, weight, dimensions, user_id, destination, status, product_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            shipment.id,
            shipment.weight,
            shipment.dimensions,
            shipment.user_id,
            shipment.destination,
            ShipmentStatus.PENDING,
            shipment.product_type,
        ];
        try {
            const [result] = await this.db.execute<mysql.ResultSetHeader>(query, values);
            const insertedId = result.insertId.toString();
            return { ...shipment, id: insertedId, status: shipment.status || ShipmentStatus.PENDING };
        } catch (error) {
            this.logger.error('[ShipmentRepository](create) Error creating shipment:', error);
            throw error;
        }
    }

    async findById(id: string): Promise<Shipment | null> {
        const query = 'SELECT * FROM shipment WHERE id = ? AND deleted_at IS NULL';
        try {
            const [rows] = await this.db.execute(query, [id]);
            return rows[0] as Shipment | null;
        } catch (error) {
            this.logger.error('[ShipmentRepository](findById) Error finding shipment by ID:', error);
            throw error;
        }
    }

    async findByUserId(userId: number): Promise<Shipment[]> {
        const query = 'SELECT * FROM shipment WHERE user_id = ? AND deleted_at IS NULL';
        try {
            const [rows] = await this.db.execute(query, [userId]);
            return rows as Shipment[];
        } catch (error) {
            this.logger.error('[ShipmentRepository](findByUserId) Error finding shipments by user ID:', error);
            throw error;
        }
    }

    async updateStatus(id: string, status: ShipmentStatus): Promise<void> {
        const query = 'UPDATE shipment SET status = ? WHERE id = ? AND deleted_at IS NULL';
        try {
            await this.db.execute(query, [status, id]);
        } catch (error) {
            this.logger.error('[ShipmentRepository](updateStatus) Error updating shipment status:', error);
            throw error;
        }
    }

    async assignDriverAndRoute(id: string, driverId: number, routeId: number): Promise<void> {
        const query = 'UPDATE shipment SET driver_id = ?, route_id = ? WHERE id = ? AND deleted_at IS NULL';
        try {
            await this.db.execute(query, [driverId, routeId, id]);
        } catch (error) {
            this.logger.error('[ShipmentRepository](assignDriverAndRoute) Error assigning driver and route:', error);
            throw error;
        }
    }

    async findAll(): Promise<Shipment[]> {
        const query = 'SELECT * FROM shipment WHERE deleted_at IS NULL';
        try {
            const [rows] = await this.db.execute(query);
            return rows as Shipment[];
        } catch (error) {
            this.logger.error('[ShipmentRepository](findAll) Error finding all shipments:', error);
            throw error;
        }
    }

    async findWithAdvancedFilters(filters: {
        startDate?: Date;
        endDate?: Date;
        status?: ShipmentStatus;
        driverId?: number;
        page?: number;
        limit?: number;
    }): Promise<{ shipments: any[]; total: number }> {
        try {
            const { startDate, endDate, status, driverId, page = 1, limit = 10 } = filters;
            const offset = (page - 1) * limit;

            let query = `
                SELECT s.*, 
                    u.name as customer_name, 
                    r.name as route_name,
                    r.distance as route_distance
                FROM shipment s
                LEFT JOIN user u ON s.user_id = u.id
                LEFT JOIN route r ON s.route_id = r.id
                WHERE s.deleted_at IS NULL
            `;

            const conditions = [];
            const params = [];

            if (startDate) {
                conditions.push('s.created_at >= ?');
                params.push(startDate);
            }

            if (endDate) {
                conditions.push('s.created_at <= ?');
                params.push(endDate);
            }

            if (status) {
                conditions.push('s.status = ?');
                params.push(status);
            }

            if (driverId) {
                conditions.push('s.driver_id = ?');
                params.push(driverId);
            }

            if (conditions.length > 0) {
                query += ` AND ${conditions.join(' AND ')}`;
            }

            const countQuery = `SELECT COUNT(*) as count FROM (${query}) as countTable`;
            const [countRows] = await this.db.execute(countQuery, params);
            const total = countRows[0].count;

            query += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
            params.push(limit, offset);

            const [shipments] = await this.db.execute(query, params);

            return { shipments: shipments as any[], total };
        } catch (error) {
            this.logger.error('[ShipmentRepository](findWithAdvancedFilters) Error finding shipments with advanced filters:', error);
            throw error;
        }
    }

    async getFilteredShipments(filters: any) {
        let sql = `SELECT * FROM shipment WHERE 1=1`;
        const params: any[] = [];

        if (filters.startDate) {
            sql += ` AND created_at >= ?`;
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            sql += ` AND created_at <= ?`;
            params.push(filters.endDate);
        }

        if (filters.status) {
            sql += ` AND status = ?`;
            params.push(filters.status);
        }

        if (filters.driverId) {
            sql += ` AND driver_id = ?`;
            params.push(filters.driverId);
        }

        const shipments = await this.db.query(sql, params);
        const metrics = await this.getShipmentMetrics(filters);

        return { shipments, metrics };
    }

    private async getShipmentMetrics(filters: any) {
        try {
            let sql = `
                SELECT s.driver_id, 
                       COUNT(*) AS totalShipments, 
                       AVG(r.estimated_time) AS avgDeliveryTime
                FROM shipment s
                JOIN route r ON s.route_id = r.id
                WHERE s.status = 'delivered'
            `;
            const params: any[] = [];

            if (filters.startDate) {
                sql += ` AND s.created_at >= ?`;
                params.push(filters.startDate);
            }

            if (filters.endDate) {
                sql += ` AND s.created_at <= ?`;
                params.push(filters.endDate);
            }

            sql += ` GROUP BY s.driver_id`;

            const [rows] = await this.db.execute(sql, params); // Asegúrate de desestructurar los resultados
            return rows; // Devuelve solo las filas
        } catch (error) {
            this.logger.error('[ShipmentRepository](getShipmentMetrics) Error executing metrics query:', error);
            throw new Error('Error calculating shipment metrics');
        }
    }

  

    async getShipmentsCountAndGroupedByDate(filters: {
        dateStart?: Date;
        dateEnd?: Date;
        status?: string;
        driverId?: number;
    }): Promise<{ total: number; groupedByDate: { date: string; total: number }[] }> {
        try {
            const conditions: string[] = [];
            const params: any[] = [];

            if (filters.dateStart && filters.dateEnd) {
                conditions.push("(s.updated_at BETWEEN ? AND ?)");
                params.push(filters.dateStart, filters.dateEnd);
            }

            if (filters.status) {
                conditions.push("(s.status = ?)");
                params.push(filters.status);
            }

            if (filters.driverId !== undefined && filters.driverId !== null) {
                conditions.push("(s.driver_id = ?)");
                params.push(filters.driverId);
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

            // Consulta para contar el total de envíos
            const totalCountSql = `
                SELECT 
                    COUNT(*) AS total
                FROM 
                    shipment s
                LEFT JOIN 
                    route r ON s.route_id = r.id
                LEFT JOIN 
                    driver d ON s.driver_id = d.id
                LEFT JOIN 
                    user u ON d.user_id = u.id
                ${whereClause}
            `;

            const groupedByDateSql = `
                SELECT 
                    DATE(s.updated_at) AS date,
                    COUNT(*) AS total
                FROM 
                    shipment s
                LEFT JOIN 
                    route r ON s.route_id = r.id
                LEFT JOIN 
                    driver d ON s.driver_id = d.id
                LEFT JOIN 
                    user u ON d.user_id = u.id
                ${whereClause}
                GROUP BY 
                    DATE(s.updated_at)
                ORDER BY 
                    DATE(s.updated_at) ASC
            `;

            // Ejecutar ambas consultas en paralelo
            const [totalResult, groupedByDateResult] = await Promise.all([
                this.db.execute(totalCountSql, params),
                this.db.execute(groupedByDateSql, params),
            ]);

            const total = totalResult[0]?.[0]?.total || 0;
            const groupedByDate = groupedByDateResult[0] as { date: string; total: number }[];

            return { total, groupedByDate };
        } catch (error) {
            this.logger.error('[ShipmentRepository](getShipmentsCountAndGroupedByDate) Error fetching shipments count and grouped by date:', error);
            throw new Error('Error fetching shipments count and grouped by date');
        }
    }
}