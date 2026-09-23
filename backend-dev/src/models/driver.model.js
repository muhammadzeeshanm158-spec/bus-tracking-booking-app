/**
 * @file driver.model.js
 * @description Driver Database Operations Model (Fixed & Cleaned)
 */

import db from '../database/db.js';

class DriverModel {
  /**
   * Sabhi drivers ko users table ke sath join karke fetch karne ka method
   */
  static async getAllDrivers() {
    const query = `
      SELECT 
        d.id, 
        d.user_id, 
        u.full_name AS name, 
        u.email, 
        u.phone_number AS phone, 
        d.license_number AS licenseNumber, 
        d.license_category AS licenseCategory, 
        d.experience_years AS experienceYears, 
        d.joining_date AS joiningDate, 
        d.is_available AS isAvailable,
        CASE 
          WHEN d.is_available = 1 THEN 'Available'
          WHEN d.is_available = 2 THEN 'On Duty'
          WHEN d.is_available = 3 THEN 'On Leave'
          ELSE 'Inactive'
        END AS status
      FROM drivers d
      JOIN users u ON d.user_id = u.id
    `;
    const [rows] = await db.query(query);
    return rows;
  }

  /**
   * ID ke zariye specific driver ko fetch karne ka method (Dynamic status ke sath)
   */
  static async getDriverById(id) {
    const query = `
      SELECT 
        d.id, 
        d.user_id, 
        u.full_name AS name, 
        u.email, 
        u.phone_number AS phone, 
        d.license_number AS licenseNumber, 
        d.license_category AS licenseCategory, 
        d.experience_years AS experienceYears, 
        d.joining_date AS joiningDate, 
        d.is_available AS isAvailable,
        CASE 
          WHEN d.is_available = 1 THEN 'Available'
          WHEN d.is_available = 2 THEN 'On Duty'
          WHEN d.is_available = 3 THEN 'On Leave'
          ELSE 'Inactive'
        END AS status
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  /**
   * Naya driver aur uska corresponding user record ek sath insert karne ka method
   */
  static async create(driverData) {
    const { 
      name, 
      email, 
      phone, 
      licenseNumber, 
      licenseCategory,
      experienceYears, 
      joiningDate,
      isAvailable 
    } = driverData;

    // Transaction start karte hain taake data consistency bani rahe
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Pehle check kar lein ke yeh email pehle se users table mein mojood toh nahi
      const [existingUser] = await connection.query(`SELECT id FROM users WHERE email = ?`, [email]);
      if (existingUser.length > 0) {
        const existingUserId = existingUser[0].id;
        
        // Check karein ke kahin is user ka driver profile pehle se toh nahi bana hua
        const [existingDriver] = await connection.query(`SELECT id FROM drivers WHERE user_id = ?`, [existingUserId]);
        if (existingDriver.length > 0) {
          throw new Error("This user is already registered as a driver!");
        }
      }

      // 1. Users table mein role_id, password aur gender ke sath record insert karein
      const userQuery = `
        INSERT INTO users (full_name, email, phone_number, password, gender, role_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const defaultPassword = '$2b$10$DefaultPasswordPlaceholderForDriver123456';
      const defaultGender = 'other';
      const driverRoleId = 3; // Role ID 3 for driver

      const [userResult] = await connection.query(userQuery, [
        name, 
        email, 
        phone,
        defaultPassword,
        defaultGender,
        driverRoleId
      ]);
      const newUserId = userResult.insertId;

      // 2. Us new user ki ID ke sath drivers table mein record insert karein
      const driverQuery = `
        INSERT INTO drivers (user_id, license_number, license_category, experience_years, joining_date, is_available)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [driverResult] = await connection.query(driverQuery, [
        newUserId, 
        licenseNumber, 
        licenseCategory || null,
        experienceYears || 0, 
        joiningDate,
        isAvailable !== undefined ? isAvailable : 1
      ]);

      await connection.commit();
      connection.release();

      return driverResult.insertId;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  /**
   * Existing driver record aur uske corresponding user record ko update karne ka method
   */
  static async update(id, driverData) {
    const { 
      name, 
      email, 
      phone, 
      licenseNumber, 
      licenseCategory, 
      experienceYears, 
      joiningDate, 
      isAvailable 
    } = driverData;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Pehle pata lagayein ke is driver ka user_id kya hai
      const [driverRows] = await connection.query(`SELECT user_id FROM drivers WHERE id = ?`, [id]);
      if (driverRows.length === 0) {
        await connection.rollback();
        connection.release();
        return 0; // Driver nahi mila
      }
      const userId = driverRows[0].user_id;

      // 2. Users table update karein (Name, Email, Phone)
      const userUpdateQuery = `
        UPDATE users 
        SET full_name = COALESCE(?, full_name), 
            email = COALESCE(?, email), 
            phone_number = COALESCE(?, phone_number)
        WHERE id = ?
      `;
      await connection.query(userUpdateQuery, [name || null, email || null, phone || null, userId]);

      // 3. Drivers table update karein
      const driverUpdateQuery = `
        UPDATE drivers 
        SET license_number = ?, 
            license_category = ?, 
            experience_years = ?, 
            joining_date = ?, 
            is_available = ?
        WHERE id = ?
      `;
      
      const [result] = await connection.query(driverUpdateQuery, [
        licenseNumber, 
        licenseCategory || null,
        experienceYears, 
        joiningDate, 
        isAvailable !== undefined ? isAvailable : 1, 
        id
      ]);

      await connection.commit();
      connection.release();

      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  /**
   * Driver aur uske corresponding user record ko delete karne ka method
   */
  static async delete(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Pehle pata lagayein ke is driver ka user_id kya hai
      const [driverRows] = await connection.query(`SELECT user_id FROM drivers WHERE id = ?`, [id]);
      if (driverRows.length === 0) {
        await connection.rollback();
        connection.release();
        return 0; // Driver nahi mila
      }
      const userId = driverRows[0].user_id;

      // 2. Pehle drivers table se record delete karein
      await connection.query(`DELETE FROM drivers WHERE id = ?`, [id]);

      // 3. Phir users table se corresponding user record delete karein
      if (userId) {
        await connection.query(`DELETE FROM users WHERE id = ?`, [userId]);
      }

      await connection.commit();
      connection.release();

      return 1; // Success
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }
}

export default DriverModel;