/**
 * @file bus.model.js
 * @description Bus Model using Raw MySQL Queries (mysql2/promise)
 */

import db from '../database/db.js';

class BusModel {
  
  // 1. Saari buses fetch karna
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM buses ORDER BY created_at DESC');
    return rows;
  }

  // 2. ID ke zariye bus talaash karna
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM buses WHERE id = ?', [id]);
    return rows[0];
  }

  // 3. Nayi bus insert karna
static async create(busData) {
    const { bus_name, bus_number, registration_number, bus_type, total_seats, is_active } = busData;
    const query = `
      INSERT INTO buses (bus_name, bus_number, registration_number, bus_type, total_seats, is_active, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await db.query(query, [
      bus_name, 
      bus_number,
      registration_number, 
      bus_type || 'Standard', 
      total_seats, 
      is_active ?? true
    ]);
    return result.insertId;
  }

  // 4. Bus update karna
  static async update(id, busData) {
    const { bus_name, bus_number, registration_number, bus_type, total_seats, is_active } = busData;
    const query = `
      UPDATE buses 
      SET bus_name = ?, bus_number = ?, registration_number = ?, bus_type = ?, total_seats = ?, is_active = ?, updated_at = NOW() 
      WHERE id = ?
    `;
    const [result] = await db.query(query, [
      bus_name, 
      bus_number,
      registration_number, 
      bus_type || 'Standard', 
      total_seats, 
      is_active ?? true,
      id
    ]);
    return result.affectedRows;
  }

  // 5. Bus delete karna
  static async delete(id) {
    const [result] = await db.query('DELETE FROM buses WHERE id = ?', [id]);
    return result.affectedRows;
  }

  // 6. Keyword ke zariye search karna (LIKE query)
  static async search(keyword) {
    const searchTerm = `%${keyword}%`;
    const query = `
      SELECT * FROM buses 
      WHERE bus_name LIKE ? OR registration_number LIKE ? OR bus_type LIKE ?
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(query, [searchTerm, searchTerm, searchTerm]);
    return rows;
  }

  // 7. Pagination handle karna
  static async getPaginated(limit, offset) {
    // Kul buses ki tadad nikalna
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM buses');
    const totalBuses = countResult[0].total;

    // Limit aur offset ke sath data nikalna
    const query = 'SELECT * FROM buses ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [buses] = await db.query(query, [limit, offset]);
    
    return { totalBuses, buses };
  }
}

export default BusModel;