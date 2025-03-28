import mysql from 'mysql2/promise';
import { config } from '../../config';
import { seedRoutes } from './routes.seed';
import { seedDrivers } from './drivers.seed';
import { seedAdmin } from './admin.seed';

async function seed() {
  console.log('Starting database seeding...');
  
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: config.db.host || "localhost",
      port: config.db.port || 3306,
      database: config.db.name || "shipping_db",
      user: config.db.user || "shipping_user",
      password: config.db.password || "shipping_password"
    });
    
    await seedAdmin(connection);    
    await seedRoutes(connection);
    await seedDrivers(connection); 
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}
if (require.main === module) {
  seed().catch(console.error);
}

export { seed };