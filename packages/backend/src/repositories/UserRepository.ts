import mysql from 'mysql2/promise';
import { User } from '../domain/entities/User';
import { Logger } from '../utils/Logger';

export class UserRepository {
    private dbConnection: mysql.Connection;
    private logger: Logger

    constructor(dbConnection: mysql.Connection, logger: Logger) {
        this.logger = logger;
        this.dbConnection = dbConnection;
    }

    async create(user: User): Promise<User> {
        try {
            const query = 'INSERT INTO user (name,email, password, role, created_at) VALUES (?, ?, ?, ?, ?)';
            const values = [user.name, user.email, user.password, user.role || 'user', user.created_at];
            const [result] = await this.dbConnection.execute<mysql.ResultSetHeader>(query, values);
            const insertedId = result.insertId;
            return { ...user, id: insertedId };
        } catch (error) {
            this.logger.error('[UserRepository](create) Error creating user :', error);
            throw error;
        }
    }

    async findById(id: number): Promise<User | null> {
        try {
            const query = 'SELECT * FROM user WHERE id = ? AND deleted_at IS NULL';
            const [rows] = await this.dbConnection.execute(query, [id]);
            return rows[0];
        } catch (error) {
            this.logger.error('[UserRepository](create) Error finding user by ID :', error);
            throw error;
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const query = 'SELECT * FROM user WHERE email = ? AND deleted_at IS NULL';
            const [rows] = await this.dbConnection.execute(query, [email]);
            return rows[0];
        } catch (error) {
            this.logger.error('[UserRepository](email) Error finding user by email repository:', error);
            throw error;
        }
    }
}