/**
 * @file payment.model.js
 * @description MySQL Database Operations for Payment Management (ES6)
 */

import db from '../database/db.js'; // Aapka MySQL connection pool ya connection instance

class Payment {
  
  // Naya payment record create karne ke liye
// Naya payment record create karne ke liye (Professional Upsert logic with ON DUPLICATE KEY UPDATE)
  static async create(paymentData) {
    const {
      booking_id,
      transaction_id,
      payment_method,
      payment_amount,
      payment_status = 'Pending',
      payment_date
    } = paymentData;

    // PROFESSIONAL FIX: Agar is booking_id ki entry pehli se mojood hai (jaise failed payment retry), 
    // toh naya insert karne ke bajaye purana record update ho jayega aur duplicate error nahi aayega.
    const query = `
      INSERT INTO payments (booking_id, transaction_id, payment_method, payment_amount, payment_status, payment_date)
      VALUES (?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
      ON DUPLICATE KEY UPDATE
        transaction_id = VALUES(transaction_id),
        payment_method = VALUES(payment_method),
        payment_amount = VALUES(payment_amount),
        payment_status = VALUES(payment_status),
        payment_date = COALESCE(VALUES(payment_date), payment_date)
    `;

    const [result] = await db.execute(query, [
      booking_id,
      transaction_id || null,
      payment_method,
      payment_amount,
      payment_status,
      payment_date || null
    ]);

    // Agar insert hua toh insertId milega, agar update hua toh existing record ki ID nikal lenge
    let paymentId = result.insertId;
    if (!paymentId || paymentId === 0) {
      const existing = await this.findByBookingId(booking_id);
      paymentId = existing ? existing.id : null;
    }

    return { id: paymentId, ...paymentData };
  }

  // Helper method jo upar use ho raha hai
  static async findByBookingId(booking_id) {
    const query = `SELECT * FROM payments WHERE booking_id = ?`;
    const [rows] = await db.execute(query, [booking_id]);
    return rows[0] || null;
  }

  // Sari payments fetch karne ke liye (Filters & Pagination ke sath)
  static async findAll(filters = {}, pagination = { limit: 10, offset: 0, sortBy: 'created_at', order: 'DESC' }) {
    let query = `SELECT * FROM payments WHERE 1=1`;
    const queryParams = [];

    if (filters.payment_status) {
      query += ` AND payment_status = ?`;
      queryParams.push(filters.payment_status);
    }

    if (filters.payment_method) {
      query += ` AND payment_method = ?`;
      queryParams.push(filters.payment_method);
    }

    if (filters.search) {
      query += ` AND transaction_id LIKE ?`;
      queryParams.push(`%${filters.search}%`);
    }

    // Sorting aur Pagination
    query += ` ORDER BY ?? ${pagination.order} LIMIT ? OFFSET ?`;
    queryParams.push(pagination.sortBy, pagination.limit, pagination.offset);

    const [rows] = await db.execute(query, queryParams);
    return rows;
  }

  // Kul payments ki tadad count karne ke liye
  static async countDocuments(filters = {}) {
    let query = `SELECT COUNT(*) as total FROM payments WHERE 1=1`;
    const queryParams = [];

    if (filters.payment_status) {
      query += ` AND payment_status = ?`;
      queryParams.push(filters.payment_status);
    }

    if (filters.payment_method) {
      query += ` AND payment_method = ?`;
      queryParams.push(filters.payment_method);
    }

    if (filters.search) {
      query += ` AND transaction_id LIKE ?`;
      queryParams.push(`%${filters.search}%`);
    }

    const [rows] = await db.execute(query, queryParams);
    return rows[0].total;
  }

  // ID ke zariye specific payment lene ke liye
  static async findById(id) {
    const query = `SELECT * FROM payments WHERE id = ?`;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }

  // Payment update karne ke liye
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE payments SET ${fields.join(', ')} WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    if (result.affectedRows === 0) return null;

    return this.findById(id);
  }

  // Payment delete karne ke liye
  static async delete(id) {
    const payment = await this.findById(id);
    if (!payment) return null;

    const query = `DELETE FROM payments WHERE id = ?`;
    await db.execute(query, [id]);
    return payment;
  }
}

export default Payment;