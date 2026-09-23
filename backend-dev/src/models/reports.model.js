/**
 * @file reports.model.js
 * @description Database queries for Reports and Analytics (ES6)
 */

import db from "../database/db.js";

export const ReportsModel = {
  // Total Revenue fetch karne ke liye
 async getTotalRevenue() {
    const [rows] = await db.query(
      "SELECT SUM(payment_amount) AS totalRevenue FROM payments WHERE payment_status = 'Paid'"
    );
    return rows[0]?.totalRevenue || 0;
  },

  // Total Bookings count karne ke liye
  async getTotalBookings() {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS totalBookings FROM bookings"
    );
    return rows[0]?.totalBookings || 0;
  },

  // Total Buses count karne ke liye
  async getTotalBuses() {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS totalBuses FROM buses"
    );
    return rows[0]?.totalBuses || 0;
  },

  // Total Customers count karne ke liye
  async getTotalCustomers() {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS totalCustomers FROM customers"
    );
    return rows[0]?.totalCustomers || 0;
  }
};