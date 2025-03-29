import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

export async function seedAdmin(db: mysql.Connection): Promise<void> {
  console.log('Seeding admin user...');
  
  try {
    const adminEmail = 'admin@shipping.com';
    
    const [existingAdmins] = await db.execute(
      'SELECT id FROM user WHERE email = ? AND role = ?',
      [adminEmail, 'admin']
    );
    
    if (Array.isArray(existingAdmins) && existingAdmins.length > 0) {
      console.log('Admin user already exists, skipping');
      return;
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.execute(
      `INSERT INTO user (name, email, password, role) 
       VALUES (?, ?, ?, ?)`,
      ['Administrator', adminEmail, hashedPassword, 'admin']
    );
    
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}