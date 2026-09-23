/**
 * @file paymentValidation.js
 * @description Request Payload Validation and Sanitization Middleware for Payment Processing (ES6)
 */

import ApiError from "../utils/ApiError.js";

/**
 * Validates and sanitizes payment transaction payloads
 */
export const createPaymentValidation = (req, res, next) => {

  const {
    booking_id,
    payment_method,
    payment_amount,
    payment_status,
    payment_date,
    card_number,
    expiry_date,
    cvv_code,
    mobile_number
  } = req.body;

  // 1. Booking ID Validation
  if (!booking_id || String(booking_id).trim() === "") {
    return next(new ApiError(400, "Booking ID is required"));
  }
  if (isNaN(Number(booking_id))) {
    return next(new ApiError(400, "Booking ID must be a valid number"));
  }
  req.body.booking_id = Number(booking_id);

  // 2. Payment Method Whitelist Validation (Frontend se keys sync ki hain)
  if (!payment_method) {
    return next(new ApiError(400, "Payment method is required"));
  }

  const allowedMethods = [
    "Card",        // Frontend ke 'Card' selection se exact match
    "JazzCash",    // Frontend ke 'JazzCash' se match
    "Easypaisa",   // Frontend ke 'Easypaisa' (small p) se match
    "Cash"
  ];

  if (!allowedMethods.includes(payment_method)) {
    return next(new ApiError(400, "Invalid payment method"));
  }

  // 3. Payment Amount Validation
  if (
    payment_amount === undefined ||
    isNaN(Number(payment_amount)) ||
    Number(payment_amount) <= 0
  ) {
    return next(new ApiError(400, "Payment amount must be greater than 0"));
  }
  req.body.payment_amount = Number(payment_amount);

  // 4. Payment Status Validation
  if (payment_status) {
    const allowedStatus = ["Pending", "Paid", "Failed", "Refunded"];
    if (!allowedStatus.includes(payment_status)) {
      return next(new ApiError(400, "Invalid payment status"));
    }
  }

  // 5. Payment Date Validation
  if (payment_date !== undefined && String(payment_date).trim() === "") {
    return next(new ApiError(400, "Payment date cannot be empty"));
  }

  // =========================================================================
  // 6. CONDITIONAL VALIDATION (METHOD KE MUTABIK FIELDS CHECK)
  // =========================================================================
  
  if (payment_method === "Card") {
    // Agar Card select hua hai toh card details lazmi check karo
    if (!card_number || String(card_number).replace(/\s/g, '').length !== 16) {
      return next(new ApiError(400, "Valid 16-digit Card Number is required"));
    }
    if (!expiry_date || String(expiry_date).trim() === "") {
      return next(new ApiError(400, "Expiry Date is required"));
    }
    if (!cvv_code || String(cvv_code).trim().length < 3) {
      return next(new ApiError(400, "Valid CVV Code is required"));
    }
  } 
  
  if (payment_method === "JazzCash" || payment_method === "Easypaisa") {
    // Agar Mobile Wallet select hua hai toh pakistani number format verify karo
    if (!mobile_number || !/^03\d{9}$/.test(mobile_number)) {
      return next(new ApiError(400, "Valid Pakistani mobile number (e.g. 03001234567) is required"));
    }
  }

  // Tamam validations clear hain, aglay handler par chalo
  next();
};

export const updatePaymentValidation = createPaymentValidation;
