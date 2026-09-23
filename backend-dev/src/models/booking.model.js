/**
 * @file booking.model.js
 * @description Database query helper model for Bookings and Booking Details (MySQL + ES6)
 */

import db from '../database/db.js';

class BookingModel {
  /**
   * Nayi booking aur uski seat details database mein insert karne ke liye transaction function
   */
  static async createBooking(bookingData, connection = db) {
    const { scheduleId, totalAmount, bookingStatus, seatNumbers, seatFare } = bookingData;

    // 1. Main `bookings` table mein record insert kar rahe hain
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (schedule_id, total_amount, booking_status) VALUES (?, ?, ?)`,
      [scheduleId, totalAmount, bookingStatus || 'Pending']
    );

    const bookingId = bookingResult.insertId;

    // 2. Agar seats / seatNumbers diye gaye hain toh `booking_details` table mein entries insert karo
    if (seatNumbers && Array.isArray(seatNumbers) && seatNumbers.length > 0) {
      const detailValues = seatNumbers.map(seatId => [
        bookingId, 
        seatId, 
        seatFare || (totalAmount / seatNumbers.length)
      ]);

      await connection.query(
        `INSERT INTO booking_details (booking_id, seat_id, seat_fare) VALUES ?`,
        [detailValues]
      );
    }

    return bookingId;
  }

  /**
   * ID ke zariye single booking aur uski saari seats fetch karne ke liye
   */
  static async findBookingById(id) {
    const [bookings] = await db.query(`SELECT * FROM bookings WHERE id = ?`, [id]);
    if (!bookings || bookings.length === 0) return null;

    const booking = bookings[0];
    
    // Associated booking details (seats) nikal rahe hain
    const [details] = await db.query(`SELECT * FROM booking_details WHERE booking_id = ?`, [id]);
    booking.seats = details;

    return booking;
  }

  /**
   * Booking update karne ke liye
   */
  static async updateBooking(id, updateData) {
    const { scheduleId, totalAmount, bookingStatus } = updateData;

    await db.query(
      `UPDATE bookings SET schedule_id = COALESCE(?, schedule_id), total_amount = COALESCE(?, total_amount), booking_status = COALESCE(?, booking_status) WHERE id = ?`,
      [scheduleId, totalAmount, bookingStatus, id]
    );

    return await this.findBookingById(id);
  }

  /**
   * Booking aur uski details delete karne ke liye
   */
  static async deleteBooking(id, connection = db) {
    // Pehle child table se data delete hoga
    await connection.query(`DELETE FROM booking_details WHERE booking_id = ?`, [id]);
    
    // Phir parent table se booking delete hogi
    const [result] = await connection.query(`DELETE FROM bookings WHERE id = ?`, [id]);
    
    return result.affectedRows;
  }

  /**
   * Paginated bookings list fetch karne ke liye
   */
  static async getPaginatedBookings(filterCondition, filterParams, limit, offset) {
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM bookings ${filterCondition}`, filterParams);
    const totalBookings = countResult[0].total;

    const [bookings] = await db.query(
      `SELECT * FROM bookings ${filterCondition} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...filterParams, limit, offset]
    );

    return { bookings, totalBookings };
  }

  /**
   * Keyword ke zariye bookings search karne ke liye
   */
  static async searchBookings(searchParam) {
    const [bookings] = await db.query(
      `SELECT * FROM bookings WHERE booking_status LIKE ? OR total_amount LIKE ?`,
      [searchParam, searchParam]
    );
    return bookings;
  }
}

export default BookingModel;