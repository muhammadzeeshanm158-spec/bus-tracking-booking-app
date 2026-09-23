/**
 * @file db.js
 * @description MySQL Database Connection Pool Configuration (ES6)
 */

import mysql from "mysql2/promise";
import env from "../config/env.js";

// Create MySQL Connection Pool (Database ke sath efficient connection management ke liye pool bana rahe hain)
const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT || 3306,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true, // Agar saari connections busy hon toh nayi request ko wait karwayega
  connectionLimit: 10,       // Ek waqt mein maximum 10 connections allow hain pool mein
  queueLimit: 0,             // Queue ki koi limit nahi hai (unlimited requests queue ho sakti hain)
  timezone: "Z",             // Date/time shifts ko rokne ke liye UTC timezone map kiya gaya hai
  dateStrings: true,         // Dates ko predictable format (YYYY-MM-DD HH:mm:ss) mein string ki shakal mein return karega
});

/**
 * Immediately verify database connectivity on module initialization
 * (Application start hotay hi database connection test kar rahe hain)
 */
(async () => {
  try {
    // Pool se ek connection acquire karke check kar rahe hain ke DB live hai ya nahi
    const connection = await pool.getConnection();
    console.log(" MySQL Database Connected Successfully!");
    connection.release(); // Connection check hone ke baad wapas pool mein return kar do
  } catch (error) {
    // Agar connection fail ho jaye toh console par error print kar do
    console.error(" MySQL Database Connection Failed:", error.message);
  }
})();

// Database connection pool ko export kar rahe hain taaki models aur queries mein use ho sakay
export default pool;