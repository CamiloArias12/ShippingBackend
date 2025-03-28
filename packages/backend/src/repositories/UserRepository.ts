import mysql from 'mysql2/promise';
import { User } from 'src/domain/entities/User';

export class UserRepository {
    private connection: mysql.Connection;

    constructor(connection: mysql.Connection) {
        this.connection = connection;
    }

    async create(user: User): Promise<User> {
        const query = 'INSERT INTO user (name,email, password, role, created_at) VALUES (?, ?, ?, ?, ?)';
        const values = [user.name,user.email, user.password, user.role || 'user', user.created_at];
        const [result] = await this.connection.execute<mysql.ResultSetHeader>(query, values);
        const insertedId = result.insertId;
        return { ...user, id: insertedId };
    }

    async findById(id: number): Promise<User | null> {
        const query = 'SELECT * FROM user WHERE id = ? AND deleted_at IS NULL';
        const [rows] = await this.connection.execute(query, [id]);
        return rows[0];
    }

    async findByEmail(email: string): Promise<User | null> {
        const query = 'SELECT * FROM user WHERE email = ? AND deleted_at IS NULL';
        const [rows] = await this.connection.execute(query, [email]);
        return rows[0];
    }

    async update(user: User): Promise<void> {
        const query = `
            UPDATE user 
            SET email = COALESCE(?, email), 
                password = COALESCE(?, password), 
                role = COALESCE(?, role) 
            WHERE id = ? AND deleted_at IS NULL`;
        const values = [, user.email, user.password, user.role, user.id];
        await this.connection.execute(query, values);
    }

    async deleteUser(id: number): Promise<void> {
        const query = 'UPDATE user SET deleted_at = ? WHERE id = ?';
        const values = [new Date(), id];
        await this.connection.execute(query, values);
    }
}