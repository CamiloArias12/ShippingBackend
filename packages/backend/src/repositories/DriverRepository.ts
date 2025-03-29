import mysql from 'mysql2/promise';
import { Driver } from '../domain/entities/Driver';
import { DriverStatus } from '@shipping/shared/enums';
import { Logger } from '../utils/Logger';

export class DriverRepository {
    private db: mysql.Connection;
    private logger: Logger;

    constructor(db: mysql.Connection, logger: Logger) {
        this.logger = logger;
        this.db = db;
    }

    async findById(id: number): Promise<Driver | null> {
        try {
            const [rows] = await this.db.execute(
                'SELECT * FROM driver WHERE id = ? AND deleted_at IS NULL',
                [id]
            );
            const drivers = rows as Driver[];
            return drivers.length ? drivers[0] : null;
        } catch (error) {
            this.logger.error('[DriverRepository](findById): Error finding driver by ID:', error);
            throw error;
        }
    }

    async findAvailableDrivers(): Promise<Driver[]> {
        try {
            const [rows] = await this.db.execute(
                `SELECT * FROM driver WHERE status = ? AND deleted_at IS NULL`,
                [DriverStatus.AVAILABLE]
            );
            return rows as Driver[];
        } catch (error) {
            this.logger.error('[DriverRepository](findAvailableDrivers) Error in findAvailableDrivers:', error);
            throw error;
        }
    }

    async updateDriverStatus(driverId: number, status: DriverStatus): Promise<void> {
        try {
            await this.db.execute(
                `UPDATE driver SET status = ? WHERE id = ?`,
                [status, driverId]
            );
        } catch (error) {
            this.logger.error('[DriverRepository](findAvailableDrivers) Error in updateDriverStatus:', error);
            throw error;
        }
    }

    async findAll(): Promise<Driver[]> {
        try {
            const [rows] = await this.db.execute(
                'SELECT * FROM driver WHERE deleted_at IS NULL'
            );
            return rows as Driver[];
        } catch (error) {
            this.logger.error('[DriverRepository](findAll) Error in findAll:', error);
            throw error;
        }
    }
}