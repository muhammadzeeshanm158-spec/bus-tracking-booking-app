/**
 * @file reportsValidation.middleware.js
 * @description Express Middleware for Reports Query Validation (ES6)
 */

import ApiError from "../utils/ApiError.js";

/**
 * Validates optional query parameters like start_date and end_date
 */
export const reportsQueryValidation = (req, res, next) => {
  const { start_date, end_date } = req.query;

  // Agar start_date ya end_date di gayi ho toh format check karo (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (start_date && !dateRegex.test(start_date)) {
    return next(new ApiError(400, "Invalid start_date format. Use YYYY-MM-DD"));
  }

  if (end_date && !dateRegex.test(end_date)) {
    return next(new ApiError(400, "Invalid end_date format. Use YYYY-MM-DD"));
  }

  // Agar sab theek hai toh aage barho
  next();
};