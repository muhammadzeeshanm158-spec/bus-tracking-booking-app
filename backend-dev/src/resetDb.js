/**
 * @file resetDb.js
 * @description Client delivery se pehle database ko clean karne aur default Admin/Driver seed karne ki automated script (ES6)
 */
import 'dotenv/config'; // <-- Yeh line sabse upar honi zaroori hai taake .env variables load ho sakein
import db from './database/db.js'; // Apne database connection ka sahi path yahan check kar lein
import bcrypt from 'bcrypt'; // Default passwords ko secure hash karne ke liye

const resetDatabase = async () => {
  try {
    console.log('🔄 Database cleaning & seeding started...');

    // 1. Foreign key checks temporary disable kar rahe hain taaki deletion mein conflict na ho
    await db.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 2. DELETE FROM use kar rahe hain taaki data 100% clear ho jaye
    await db.query('DELETE FROM payments;');
    await db.query('DELETE FROM bookings;');
    await db.query('DELETE FROM schedules;');
    await db.query('DELETE FROM buses;');
    await db.query('DELETE FROM routes;');
    await db.query('DELETE FROM users;');

    // Auto-increment IDs ko wapis 1 se reset kar rahe hain
    await db.query('ALTER TABLE payments AUTO_INCREMENT = 1;');
    await db.query('ALTER TABLE bookings AUTO_INCREMENT = 1;');
    await db.query('ALTER TABLE schedules AUTO_INCREMENT = 1;');
    await db.query('ALTER TABLE buses AUTO_INCREMENT = 1;');
    await db.query('ALTER TABLE routes AUTO_INCREMENT = 1;');
    await db.query('ALTER TABLE users AUTO_INCREMENT = 1;');

    // 3. Foreign key checks wapis enable kar rahe hain
    await db.query('SET FOREIGN_KEY_CHECKS = 1;');

    // 4. Default Admin aur Driver accounts generate kar rahe hain (Capital letters ke sath)
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const driverPassword = await bcrypt.hash('Driver@123', 10);

    // Database khali hone ke baad default accounts insert karwa rahe hain (ek hi daafa)
    await db.query(`
      INSERT INTO users (full_name, email, phone_number, password, gender, role_id) VALUES 
      ('System Admin', 'admin@busapp.com', '03000000001', ?, 'Male', 1),
      ('Test Driver', 'driver@busapp.com', '03000000002', ?, 'Male', 2)
    `, [adminPassword, driverPassword]);

    console.log('✅ Success! Database has been successfully cleaned and default Admin/Driver accounts have been seeded.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error while resetting database:', error.message);
    process.exit(1);
  }
};

resetDatabase();