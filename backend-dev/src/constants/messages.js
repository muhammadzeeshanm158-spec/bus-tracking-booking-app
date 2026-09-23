/**
 * @file messages.js
 * @description Centralized Dictionary for Application Response & Error Messages (ES6)
 */

const messages = {
  // --- Auth & User Messages ---
  USER_CREATED: "User registered successfully",
  LOGIN_SUCCESS: "Login successful",
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
  UNAUTHORIZED: "Unauthorized access. Token missing or invalid",
  FORBIDDEN: "Access denied. You do not have permission to perform this action",

  // --- Bus & Route Messages ---
  BUS_CREATED: "Bus added successfully",
  BUS_UPDATED: "Bus details updated successfully",
  BUS_DELETED: "Bus removed successfully",
  BUS_NOT_FOUND: "Bus not found",
  ROUTE_CREATED: "Route created successfully",
  ROUTE_NOT_FOUND: "Route not found",

  // --- Schedule Messages ---
  SCHEDULE_CREATED: "Travel schedule created successfully",
  SCHEDULE_NOT_FOUND: "Schedule not found",

  // --- Booking Messages ---
  BOOKING_CREATED: "Seat booked successfully",
  BOOKING_CANCELLED: "Booking cancelled successfully",
  BOOKING_NOT_FOUND: "Booking record not found",

  // --- Payment Messages ---
  PAYMENT_SUCCESS: "Payment processed successfully",
  PAYMENT_FAILED: "Payment processing failed",

  // --- Global / System Errors ---
  INTERNAL_SERVER_ERROR: "Internal server error occurred",
  VALIDATION_ERROR: "Validation failed for request body",
};

export default messages;