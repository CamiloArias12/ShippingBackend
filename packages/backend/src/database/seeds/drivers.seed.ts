import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

export async function seedDrivers(db: mysql.Connection): Promise<void> {
    const drivers = [
        {
            user: {
                name: 'Carlos Rodríguez',
                email: 'carlos.driver@example.com',
                password: 'password123',
                role: 'driver'
            },
            driver: {
                license: 'DR12345678',
                vehicle_type: 'Van',
                vehicle_capacity: 2500.00,
                status: 'available'
            }
        },
        {
            user: {
                name: 'Maria González',
                email: 'maria.driver@example.com',
                password: 'password123',
                role: 'driver'
            },
            driver: {
                license: 'DR87654321',
                vehicle_type: 'Truck',
                vehicle_capacity: 5000.00,
                status: 'available'

            }
        },
        {
            user: {
                name: 'Juan López',
                email: 'juan.driver@example.com',
                password: 'password123',
                role: 'driver'
            },
            driver: {
                license: 'DR24681357',
                vehicle_type: 'Small Truck',
                vehicle_capacity: 3500.00,
                route_id: 3,
                status: 'available'
            }
        }
    ];

    for (const driverData of drivers) {
        try {
            const [existingUsers] = await db.execute(
                'SELECT id FROM user WHERE email = ?',
                [driverData.user.email]
            );

            let userId: number;

            if (Array.isArray(existingUsers) && existingUsers.length > 0) {
                userId = (existingUsers[0] as mysql.RowDataPacket).id;
            } else {
                const hashedPassword = await bcrypt.hash(driverData.user.password, 10);

                const [result] = await db.execute(
                    `INSERT INTO user (name, email, password, role) VALUES (?, ?, ?, ?)`,
                    [driverData.user.name, driverData.user.email, hashedPassword, driverData.user.role]
                );

                userId = (result as mysql.ResultSetHeader).insertId;
            }

            const [existingDrivers] = await db.execute(
                'SELECT id FROM driver WHERE user_id = ?',
                [userId]
            );

            if (Array.isArray(existingDrivers) && existingDrivers.length > 0) {
                console.log(`Driver for user ID ${userId} already exists, skipping`);
                continue;
            }

            await db.execute(
                `INSERT INTO driver 
        (user_id, license, vehicle_type, vehicle_capacity, status) 
        VALUES (?, ?, ?, ?, ?)`,
                [
                    userId,
                    driverData.driver.license,
                    driverData.driver.vehicle_type,
                    driverData.driver.vehicle_capacity,
                    driverData.driver.status,
                ]
            );

            console.log(`Created driver for user ID: ${userId}`);
        } catch (error) {
            console.error(`Error seeding driver ${driverData.user.email}:`, error);
        }
    }

    console.log('Drivers seeding completed');
}