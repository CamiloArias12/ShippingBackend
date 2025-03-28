import mysql from 'mysql2/promise';
import { Shipment } from '../domain/entities/Shipment';
import { ShipmentStatus } from '@shipping/shared/dist/enums';
import { Logger } from '../utils/Logger';


export class ShipmentRepository {
    private db: mysql.Connection;
    private logger: Logger

    constructor(db: mysql.Connection, logger: Logger) {
        this.logger = logger;
        this.db = db;
    }

    async create(shipment: Shipment): Promise<Shipment> {
        const query = `
                INSERT INTO shipment (weight, dimensions, user_id, destination, status, product_type)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
        const values = [
            shipment.weight,
            shipment.dimensions,
            shipment.user_id,
            shipment.destination,
            ShipmentStatus.PENDING,
            shipment.product_type,
        ];
        try {
            const [result] = await this.db.execute<mysql.ResultSetHeader>(query, values);
            const insertedId = result.insertId;
            return { ...shipment, id: insertedId, status: shipment.status || ShipmentStatus.PENDING };
        } catch (error) {
            this.logger.error('[RouteRepository](create) Error creating shipment:', error);
            throw error;
        }
    }

    async findById(id: number): Promise<Shipment | null> {
        const query = 'SELECT * FROM shipment WHERE id = ? AND deleted_at IS NULL';
        try {
            const [rows] = await this.db.execute(query, [id]);
            return rows[0] as Shipment | null;
        } catch (error) {
            this.logger.error('[RouteRepository](findById) Error finding shipment by ID:', error);
            throw error;
        }
    }

    async findByUserId(userId: number): Promise<Shipment[]> {
        const query = 'SELECT * FROM shipment WHERE user_id = ? AND deleted_at IS NULL';
        try {
            const [rows] = await this.db.execute(query, [userId]);
            return rows as Shipment[];
        } catch (error) {
            this.logger.error('[RouteRepository](findByUserId) Error finding shipments by user ID:', error);
            throw error;
        }
    }

    async updateStatus(id: number, status: ShipmentStatus): Promise<void> {
        const query = 'UPDATE shipment SET status = ? WHERE id = ? AND deleted_at IS NULL';
        try {
            await this.db.execute(query, [status, id]);
        } catch (error) {
            this.logger.error('[RouteRepository](updateStatus) Error updating shipment status:', error);
            throw error;
        }
    }

    async assignDriverAndRoute(id: number, driverId: number, routeId: number): Promise<void> {
        const query = 'UPDATE shipment SET driver_id = ?, route_id = ? WHERE id = ? AND deleted_at IS NULL';
        try {
            await this.db.execute(query, [driverId, routeId, id]);
        } catch (error) {
            this.logger.error('[RouteRepository](assignDriverAndRoute) Error assigning driver and route:', error);
            throw error;
        }
    }

    async findWithAdvancedFilters(
        filters: {
            startDate?: Date;
            endDate?: Date;
            status?: ShipmentStatus;
            driverId?: number;
            page?: number;
            limit?: number;
        }
    ): Promise<{ shipments: any[], total: number }> {
        try {
            const { startDate, endDate, status, driverId, page = 1, limit = 10 } = filters;
            const offset = (page - 1) * limit;
            let query = `
                SELECT s.*, 
                    u.name as customer_name, 
                    d.name as driver_name,
                    r.name as route_name,
                    r.distance as route_distance
                FROM shipment s
                LEFT JOIN user u ON s.user_id = u.id
                LEFT JOIN driver d ON s.driver_id = d.id
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
            this.logger.error('[RouteRepository](findWithAdvancedFilters) Error finding shipments with advanced filters:', error);
            throw error;
        }
    }

    async getPerformanceMetrics(
        filters: {
            startDate?: Date;
            endDate?: Date;
        }
    ): Promise<any> {
        try {
            const { startDate, endDate } = filters;
            const params = [];

            let timeRangeCondition = '';
            if (startDate && endDate) {
                timeRangeCondition = 'WHERE s.created_at BETWEEN ? AND ? AND s.deleted_at IS NULL';
                params.push(startDate, endDate);
            } else if (startDate) {
                timeRangeCondition = 'WHERE s.created_at >= ? AND s.deleted_at IS NULL';
                params.push(startDate);
            } else if (endDate) {
                timeRangeCondition = 'WHERE s.created_at <= ? AND s.deleted_at IS NULL';
                params.push(endDate);
            } else {
                timeRangeCondition = 'WHERE s.deleted_at IS NULL';
            }

            const avgDeliveryTimeQuery = `
                SELECT 
                    d.id as driver_id, 
                    d.name as driver_name,
                    AVG(TIMESTAMPDIFF(HOUR, 
                        (SELECT MIN(sh.changed_at) FROM shipment_status_history sh 
                        WHERE sh.shipment_id = s.id AND sh.new_status = 'in_transit'),
                        (SELECT MIN(sh.changed_at) FROM shipment_status_history sh 
                        WHERE sh.shipment_id = s.id AND sh.new_status = 'delivered')
                    )) as avg_delivery_hours,
                    COUNT(s.id) as total_shipments,
                    SUM(CASE WHEN s.status = 'delivered' THEN 1 ELSE 0 END) as completed_shipments,
                    SUM(CASE WHEN s.status = 'in_transit' THEN 1 ELSE 0 END) as in_transit_shipments,
                    SUM(CASE WHEN s.status = 'pending' THEN 1 ELSE 0 END) as pending_shipments
                FROM shipment s
                JOIN driver d ON s.driver_id = d.id
                ${timeRangeCondition}
                GROUP BY d.id, d.name
            `;

            const overallMetricsQuery = `
                SELECT
                    COUNT(id) as total_shipments,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed_shipments,
                    SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as in_transit_shipments,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_shipments,
                    AVG(CASE WHEN status = 'delivered' THEN 
                        TIMESTAMPDIFF(HOUR, created_at, 
                        (SELECT MIN(changed_at) FROM shipment_status_history 
                        WHERE shipment_id = shipment.id AND new_status = 'delivered')
                        )
                        ELSE NULL END) as avg_delivery_time_hours
                FROM shipment
                ${timeRangeCondition}
            `;
            const monthlyTrendsQuery = `
                SELECT 
                    DATE_FORMAT(s.created_at, '%Y-%m') as month,
                    COUNT(s.id) as total_shipments,
                    SUM(CASE WHEN s.status = 'delivered' THEN 1 ELSE 0 END) as completed_shipments
                FROM shipment s
                ${timeRangeCondition}
                GROUP BY DATE_FORMAT(s.created_at, '%Y-%m')
                ORDER BY month
            `;

            const [driverPerformance] = await this.db.execute(avgDeliveryTimeQuery, params);
            const [overallMetrics] = await this.db.execute(overallMetricsQuery, params);
            const [monthlyTrends] = await this.db.execute(monthlyTrendsQuery, params);

            return {
                driverPerformance,
                overallMetrics: overallMetrics[0],
                monthlyTrends
            };
        } catch (error) {
            this.logger.error('[RouteRepository](getPerformanceMetrics) Error getting performance metrics:', error);
            throw error;
        }
    }
}