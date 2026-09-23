/**
 * @file user.model.js
 * @description MySQL Model for User Account Management (Pure MVC + ES6)
 */

import db from "../database/db.js"; // Aapki MySQL connection pool file

export const UserModel = {
  // Saare users ko fetch karne ke liye with optional search and role filtering
  getAllFiltered: async (filters = {}) => {
    let query = `
      SELECT u.id, u.full_name, u.email, u.phone_number, u.gender, u.role_id, u.created_at, u.updated_at, 
             r.role_name AS role
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.search) {
      query += " AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone_number LIKE ?)";
      const search = `%${filters.search}%`;
      params.push(search, search, search);
    }

    if (filters.role_id !== undefined && filters.role_id !== null) {
      query += " AND u.role_id = ?";
      params.push(filters.role_id);
    }

    query += " ORDER BY u.created_at DESC";
    const [rows] = await db.query(query, params);
    return rows;
  },

  // ID ke zariye user ko find karne ke liye function (Profile fetch karne ke liye - role_name samait)
  findById: async (userId) => {
    const [rows] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone_number, u.gender, u.role_id, u.created_at, u.updated_at, r.role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [userId]
    );
    return rows[0]; // Pehla row return karega agar mila toh
  },

  // Email ke zariye user ko find karne ke liye function (Login/Signup check - roles table ke sath JOIN)
  findByEmail: async (email) => {
    const [rows] = await db.query(
      `SELECT u.*, r.role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ?`,
      [email]
    );
    return rows[0];
  },

  // Naya user database mein insert karne ke liye function (Phone number aur gender ke sath)
  create: async (userData) => {
    const { full_name, email, phone_number, password, gender, role_id = 2 } = userData;
    const [result] = await db.query(
      "INSERT INTO users (full_name, email, phone_number, password, gender, role_id) VALUES (?, ?, ?, ?, ?, ?)",
      [full_name, email, phone_number, password, gender, role_id]
    );
    return result.insertId; // Naye banne walay user ki ID wapas dega
  },

  // User ki profile details ko update karne ke liye function
  updateProfile: async (userId, userData) => {
    const { full_name, email, phone_number, gender, role_id } = userData;
    const [result] = await db.query(
      "UPDATE users SET full_name = ?, email = ?, phone_number = ?, gender = ?, role_id = ? WHERE id = ?",
      [full_name, email, phone_number, gender, role_id, userId]
    );
    return result.affectedRows; // Batata hai ke kitni rows update huin
  },

  // Sirf User ka Role update karne ke liye function (Admin Panel ke liye)
  updateRole: async (userId, roleName) => {
    let roleId = 2; // Default Driver
    if (roleName === 'Admin') roleId = 1;
    else if (roleName === 'Driver') roleId = 2;
    else if (roleName === 'Customer') roleId = 3;

    const [result] = await db.query(
      "UPDATE users SET role_id = ? WHERE id = ?",
      [roleId, userId]
    );
    return result.affectedRows;
  },

  // User ko delete karne ke liye function
  deleteUser: async (userId) => {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId]);
    return result.affectedRows > 0; // True return karega agar row delete ho gayi ho
  }
};

export default UserModel;