/**
 * @file booking.controller.js
 * @description Express Controller Handlers for Booking Operations with WebSockets (MySQL + Pure MVC + ES6)
 */

import db from '../database/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import HTTP_STATUS from '../utils/httpStatus.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * @desc    Create a new seat booking record along with dynamic user and booking details (seats)
 * @route   POST /api/v1/bookings
 */
export const createBookingController = asyncHandler(async (req, res) => {
  const { scheduleId, seatNumbers, totalAmount, bookingStatus, seatFare, customerName, customerPhone, cnic } = req.body;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Check karein ke kya mangwayi gayi seats pehle se is schedule ke liye book ho chuki hain?
    if (seatNumbers && Array.isArray(seatNumbers) && seatNumbers.length > 0) {
      // Seat identifiers ko IDs ya numbers ke taur par check karna
      for (const seatIdentifier of seatNumbers) {
        let seatIdCheck = seatIdentifier;
        if (isNaN(seatIdentifier)) {
          const [seatRow] = await connection.query(
            `SELECT id FROM seats WHERE seat_number = ? LIMIT 1`, 
            [seatIdentifier]
          );
          if (seatRow && seatRow.length > 0) {
            seatIdCheck = seatRow[0].id;
          }
        }

        const [existingSeatBooking] = await connection.query(
          `SELECT bd.id FROM booking_details bd 
           JOIN bookings b ON bd.booking_id = b.id 
           WHERE b.schedule_id = ? AND bd.seat_id = ?`,
          [scheduleId, seatIdCheck]
        );

        if (existingSeatBooking && existingSeatBooking.length > 0) {
          await connection.rollback();
          connection.release();
          return errorResponse(res, `Seat ${seatIdentifier} pehle se hi book ho chuki hai! Bara-e-karam doosri seat select karein.`, HTTP_STATUS.BAD_REQUEST);
        }
      }
    }

    let assignedUserId = req.user?.id;

    // Agar frontend se customer phone aya hai toh user find ya create karein
    if (!assignedUserId && customerPhone) {
      const [existingUser] = await connection.query(
        `SELECT id FROM users WHERE phone_number = ?`,
        [customerPhone]
      );

      if (existingUser.length > 0) {
        assignedUserId = existingUser[0].id;
        if (customerName || cnic) {
          await connection.query(
            `UPDATE users SET full_name = COALESCE(?, full_name), cnic = COALESCE(?, cnic) WHERE id = ?`,
            [customerName, cnic, assignedUserId]
          );
        }
      } else {
        const [userResult] = await connection.query(
          `INSERT INTO users (full_name, phone_number, cnic, email, password, role_id, gender) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            customerName || 'Guest User', 
            customerPhone, 
            cnic || null,
            `${customerPhone.replace(/[^0-9]/g, '')}@booking.com`, 
            'default_password_hash', 
            2, 
            'Other'
          ]
        );
        assignedUserId = userResult.insertId;
      }
    }

    assignedUserId = assignedUserId || 1;

    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (user_id, schedule_id, total_amount, booking_status) VALUES (?, ?, ?, ?)`,
      [assignedUserId, scheduleId, totalAmount, bookingStatus || 'Pending']
    );

    const bookingId = bookingResult.insertId;

    if (seatNumbers && Array.isArray(seatNumbers) && seatNumbers.length > 0) {
      const computedFare = seatFare || (totalAmount / seatNumbers.length);
      
      for (const seatIdentifier of seatNumbers) {
        let seatIdToInsert = seatIdentifier;

        if (isNaN(seatIdentifier)) {
          const [seatRow] = await connection.query(
            `SELECT id FROM seats WHERE seat_number = ? LIMIT 1`, 
            [seatIdentifier]
          );
          if (seatRow && seatRow.length > 0) {
            seatIdToInsert = seatRow[0].id;
          }
        }

        await connection.query(
          `INSERT INTO booking_details (booking_id, seat_id, seat_fare) VALUES (?, ?, ?)`,
          [bookingId, seatIdToInsert, computedFare]
        );
      }
    }

    await connection.commit();
    connection.release();

    // --- WEBSOCKET TRIGGER ---
    // Nayi booking hone par schedule room aur admin ko live update bhejna taake seat map sync rahay
    const io = req.app.get("io");
    if (io) {
      io.to(`schedule_${scheduleId}`).to('admin-room').emit('seat_booked', {
        scheduleId,
        bookingId,
        seatNumbers,
        message: 'New seat booking created successfully in real-time.'
      });
    }

    return successResponse(res, "Booking created successfully", { bookingId, scheduleId, totalAmount }, HTTP_STATUS.CREATED);
  
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
});

/**
 * @desc    Retrieve details of a single booking record by ID with its seats and relations
 * @route   GET /api/v1/bookings/:id
 */
export const getBookingByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const [rawBookings] = await db.query(
    `SELECT 
        b.*, 
        u.full_name AS customerName, 
        u.phone_number AS customerPhone,
        u.cnic AS cnicNumber,
        c1.city_name AS routeOrigin,
        c2.city_name AS routeDestination,
        bu.bus_number AS busNumber
     FROM bookings b
     LEFT JOIN users u ON b.user_id = u.id
     LEFT JOIN schedules s ON b.schedule_id = s.id
     LEFT JOIN routes r ON s.route_id = r.id
     LEFT JOIN cities c1 ON r.source_city_id = c1.id
     LEFT JOIN cities c2 ON r.destination_city_id = c2.id
     LEFT JOIN buses bu ON s.bus_id = bu.id
     WHERE b.id = ?`,
    [id]
  );

  if (!rawBookings || rawBookings.length === 0) {
    return errorResponse(res, 'Booking not found', HTTP_STATUS.NOT_FOUND);
  }

  const booking = {
    ...rawBookings[0],
    totalAmount: rawBookings[0].total_amount,
    bookingStatus: rawBookings[0].booking_status,
    paymentMethod: rawBookings[0].payment_method || 'cash',
    cnicNumber: rawBookings[0].cnicNumber || rawBookings[0].cnic || 'N/A'
  };

  const [details] = await db.query(
    `SELECT bd.*, st.seat_number FROM booking_details bd LEFT JOIN seats st ON bd.seat_id = st.id WHERE bd.booking_id = ?`, 
    [id]
  );

  booking.seats = details;
  booking.seat_numbers = details.map(d => d.seat_number || d.seat_id);

  return successResponse(res, "Booking details retrieved successfully", booking, HTTP_STATUS.OK);
});

/**
 * @desc    Update details of an existing booking record (Along with user details, seats, and payment method)
 * @route   PUT /api/v1/bookings/:id
 */
export const updateBookingController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { 
    scheduleId, schedule_id,
    totalAmount, total_amount,
    bookingStatus, booking_status,
    customerName, customer_name, 
    customerPhone, customer_phone, 
    cnic, cnic_number, cnicNumber,
    seatNumbers, seat_numbers,
    paymentMethod, payment_method
  } = req.body;

  const finalScheduleId = scheduleId !== undefined ? scheduleId : schedule_id;
  const finalTotalAmount = totalAmount !== undefined ? totalAmount : total_amount;
  const finalBookingStatus = bookingStatus !== undefined ? bookingStatus : booking_status;
  const finalCustomerName = customerName !== undefined ? customerName : customer_name;
  const finalCustomerPhone = customerPhone !== undefined ? customerPhone : customer_phone;
  const finalCnic = cnic !== undefined ? cnic : (cnicNumber !== undefined ? cnicNumber : cnic_number);
  const finalSeats = seatNumbers || seat_numbers;
  const finalPaymentMethod = paymentMethod !== undefined ? paymentMethod : payment_method;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [existingBooking] = await connection.query(`SELECT * FROM bookings WHERE id = ?`, [id]);
    if (!existingBooking || existingBooking.length === 0) {
      connection.release();
      return errorResponse(res, 'Booking not found', HTTP_STATUS.NOT_FOUND);
    }

    const booking = existingBooking[0];
    const userId = booking.user_id;

    let bookingFieldsToUpdate = [];
    let bookingQueryParams = [];

    if (finalScheduleId !== undefined) {
      bookingFieldsToUpdate.push("schedule_id = ?");
      bookingQueryParams.push(finalScheduleId);
    }
    if (finalTotalAmount !== undefined) {
      bookingFieldsToUpdate.push("total_amount = ?");
      bookingQueryParams.push(finalTotalAmount);
    }
    if (finalBookingStatus !== undefined) {
      bookingFieldsToUpdate.push("booking_status = ?");
      bookingQueryParams.push(finalBookingStatus);
    }
    if (finalPaymentMethod !== undefined) {
      bookingFieldsToUpdate.push("payment_method = ?");
      bookingQueryParams.push(finalPaymentMethod);
    }

    if (bookingFieldsToUpdate.length > 0) {
      bookingQueryParams.push(id);
      await connection.query(
        `UPDATE bookings SET ${bookingFieldsToUpdate.join(", ")} WHERE id = ?`,
        bookingQueryParams
      );
    }

    if (finalSeats && Array.isArray(finalSeats)) {
      await connection.query(`DELETE FROM booking_details WHERE booking_id = ?`, [id]);

      if (finalSeats.length > 0) {
        const computedFare = finalTotalAmount ? (finalTotalAmount / finalSeats.length) : 0;
        
        for (const seatIdentifier of finalSeats) {
          let seatIdToInsert = seatIdentifier;

          if (isNaN(seatIdentifier)) {
            const [seatRow] = await connection.query(
              `SELECT id FROM seats WHERE seat_number = ? LIMIT 1`, 
              [seatIdentifier]
            );
            if (seatRow && seatRow.length > 0) {
              seatIdToInsert = seatRow[0].id;
            }
          }

          await connection.query(
            `INSERT INTO booking_details (booking_id, seat_id, seat_fare) VALUES (?, ?, ?)`,
            [id, seatIdToInsert, computedFare]
          );
        }
      }
    }

    if (userId) {
      let userFieldsToUpdate = [];
      let userQueryParams = [];

      if (finalCustomerName !== undefined) {
        userFieldsToUpdate.push("full_name = ?");
        userQueryParams.push(finalCustomerName);
      }
      if (finalCustomerPhone !== undefined) {
        userFieldsToUpdate.push("phone_number = ?");
        userQueryParams.push(finalCustomerPhone);
      }
      if (finalCnic !== undefined) {
        userFieldsToUpdate.push("cnic = ?");
        userQueryParams.push(finalCnic);
      }

      if (userFieldsToUpdate.length > 0) {
        userQueryParams.push(userId);
        await connection.query(
          `UPDATE users SET ${userFieldsToUpdate.join(", ")} WHERE id = ?`,
          userQueryParams
        );
      }
    }

    await connection.commit();
    connection.release();

    const [updatedRows] = await db.query(
      `SELECT 
          b.*, 
          u.full_name AS customerName, 
          u.phone_number AS customerPhone,
          u.cnic AS cnicNumber
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [id]
    );

    // --- WEBSOCKET TRIGGER ---
    const io = req.app.get("io");
    if (io) {
      io.to('customers-room').to('admin-room').emit('booking_updated', {
        bookingId: id,
        message: 'Booking details have been updated successfully.'
      });
    }

    return successResponse(res, "Booking updated successfully", updatedRows[0], HTTP_STATUS.OK);

  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
});

/**
 * @desc    Delete or cancel a booking record by ID (Along with its booking details)
 * @route   DELETE /api/v1/bookings/:id
 */
export const deleteBookingController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(`DELETE FROM booking_details WHERE booking_id = ?`, [id]);
    const [result] = await connection.query(`DELETE FROM bookings WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Booking not found', HTTP_STATUS.NOT_FOUND);
    }

    await connection.commit();
    connection.release();

    // --- WEBSOCKET TRIGGER ---
    const io = req.app.get("io");
    if (io) {
      io.to('customers-room').to('admin-room').emit('booking_deleted', {
        bookingId: id,
        message: 'Booking has been canceled/deleted.'
      });
    }

    return successResponse(res, "Booking deleted successfully", null, HTTP_STATUS.OK);

  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
});

/**
 * @desc    Retrieve a paginated, sorted, and status-filtered list of bookings with all relations
 * @route   GET /api/v1/bookings
 */
export const getPaginatedBookingsController = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  let queryCondition = '';
  let queryParams = [];

  if (req.query.booking_status) {
    queryCondition = 'WHERE b.booking_status = ?';
    queryParams.push(req.query.booking_status);
  }

  const [countResult] = await db.query(`SELECT COUNT(*) as total FROM bookings b ${queryCondition}`, queryParams);
  const totalBookings = countResult[0].total;

  const [rawBookings] = await db.query(
    `SELECT 
        b.*, 
        u.full_name AS customerName, 
        u.phone_number AS customerPhone,
        u.cnic AS cnicNumber,
        c1.city_name AS originCity,
        c2.city_name AS destinationCity,
        bu.bus_number AS busNumber,
        GROUP_CONCAT(st.seat_number) AS seat_numbers_str
     FROM bookings b
     LEFT JOIN users u ON b.user_id = u.id
     LEFT JOIN schedules s ON b.schedule_id = s.id
     LEFT JOIN routes r ON s.route_id = r.id
     LEFT JOIN cities c1 ON r.source_city_id = c1.id
     LEFT JOIN cities c2 ON r.destination_city_id = c2.id
     LEFT JOIN buses bu ON s.bus_id = bu.id
     LEFT JOIN booking_details bd ON b.id = bd.booking_id
     LEFT JOIN seats st ON bd.seat_id = st.id
     ${queryCondition}
     GROUP BY b.id
     ORDER BY b.id DESC, b.created_at DESC 
     LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  const bookings = rawBookings.map(b => ({
    ...b,
    totalAmount: b.total_amount,
    bookingStatus: b.booking_status,
    paymentMethod: b.payment_method || 'cash',
    routeOrigin: b.originCity && b.destinationCity ? `${b.originCity} ➔ ${b.destinationCity}` : (b.routeOrigin || null),
    cnicNumber: b.cnicNumber || b.cnic || 'N/A',
    seat_numbers: b.seat_numbers_str ? b.seat_numbers_str.split(',') : []
  }));

  const result = {
    bookings,
    currentPage: page,
    totalPages: Math.ceil(totalBookings / limit) || 1,
    totalBookings,
  };

  return successResponse(res, "Paginated bookings retrieved successfully", result, HTTP_STATUS.OK);
});

/**
 * @desc    Search booking records using a keyword string
 * @route   GET /api/v1/bookings/search
 */
export const searchBookingsController = asyncHandler(async (req, res) => {
  const { keyword } = req.query;
  
  if (!keyword) {
    return successResponse(res, "Search results retrieved successfully", [], HTTP_STATUS.OK);
  }

  const searchParam = `%${keyword}%`;

  const [bookings] = await db.query(
    `SELECT * FROM bookings WHERE booking_status LIKE ? OR total_amount LIKE ?`,
    [searchParam, searchParam]
  );

  return successResponse(res, "Search results retrieved successfully", bookings, HTTP_STATUS.OK);
});