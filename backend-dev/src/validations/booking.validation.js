/**
 * @file booking.validation.js
 * @description Request Payload Validation Middleware for Seat Booking (ES6)
 */

import ApiError from "../utils/ApiError.js";

/**
 * Validates booking creation payload attributes (Schedule, Total Amount, and Seat Numbers)
 */
export const createBookingValidation = (req, res, next) => {
  const { scheduleId, totalAmount, seatNumbers, bookingStatus } = req.body;

  // 1. Schedule ID validation
  const parsedScheduleId = Number(scheduleId);
  if (!scheduleId || isNaN(parsedScheduleId) || parsedScheduleId <= 0) {
    return next(new ApiError(400, "Schedule ID is required and must be a valid number"));
  }

  // 2. Total Amount validation
  const parsedAmount = Number(totalAmount);
  if (totalAmount === undefined || totalAmount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
    return next(new ApiError(400, "Total amount is required and must be a positive number"));
  }

  // 3. Seat Numbers validation (Crucial for seat selection logic)
  if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return next(new ApiError(400, "Please select at least one seat before booking"));
  }

  // Optional: Validate individual seat IDs/Numbers
  for (const seat of seatNumbers) {
    if (isNaN(Number(seat)) || Number(seat) <= 0) {
      return next(new ApiError(400, "Invalid seat number format detected"));
    }
  }

  // 4. Optional Booking Status formatting
  if (bookingStatus) {
    const allowedStatuses = ["Pending", "Confirmed", "Cancelled", "Completed"];
    const formattedStatus = 
      String(bookingStatus).charAt(0).toUpperCase() + 
      String(bookingStatus).slice(1).toLowerCase();

    if (!allowedStatuses.includes(formattedStatus)) {
      return next(new ApiError(400, "Invalid booking status value"));
    }
    req.body.booking_status = formattedStatus;
  }

  next();
};

/**
 * Validates partial updates for bookings
 */
export const updateBookingValidation = (req, res, next) => {
  const { scheduleId, totalAmount, bookingStatus } = req.body;

  if (scheduleId !== undefined && (isNaN(Number(scheduleId)) || Number(scheduleId) <= 0)) {
    return next(new ApiError(400, "Schedule ID must be a valid number"));
  }

  if (totalAmount !== undefined && (isNaN(Number(totalAmount)) || Number(totalAmount) <= 0)) {
    return next(new ApiError(400, "Total amount must be a positive number"));
  }

  if (bookingStatus !== undefined) {
    const allowedStatuses = ["Pending", "Confirmed", "Cancelled", "Completed"];
    const formattedStatus = 
      String(bookingStatus).charAt(0).toUpperCase() + 
      String(bookingStatus).slice(1).toLowerCase();

    if (!allowedStatuses.includes(formattedStatus)) {
      return next(new ApiError(400, "Invalid booking status value"));
    }
    req.body.booking_status = formattedStatus;
  }

  next();
};