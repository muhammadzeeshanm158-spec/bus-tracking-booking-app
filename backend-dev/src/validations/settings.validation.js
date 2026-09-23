/**
 * @file settingsValidation.middleware.js
 * @description Express Middleware for Settings Payload Validation (ES6)
 */

import ApiError from "../utils/ApiError.js";

export const updateSettingsValidation = (req, res, next) => {
  const {
    company_name,
    support_email,
    contact_phone,
    currency,
    tax_percentage,
    allow_online_booking,
    cancellation_hours_limit,
    address
  } = req.body;

  // 1. Company Name Validation
  if (company_name !== undefined) {
    if (typeof company_name !== "string" || company_name.trim().length < 2) {
      return next(new ApiError(400, "Company name must be at least 2 characters long"));
    }
    req.body.company_name = company_name.trim();
  }

  // 2. Support Email Validation
  if (support_email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (support_email && !emailRegex.test(support_email)) {
      return next(new ApiError(400, "Invalid support email format"));
    }
  }

  // 3. Contact Phone Validation (Optional check)
  if (contact_phone !== undefined) {
    if (typeof contact_phone !== "string" && typeof contact_phone !== "number") {
      return next(new ApiError(400, "Contact phone must be a valid string or number"));
    }
  }

  // 4. Currency Validation (3-letter code like PKR, USD)
  if (currency !== undefined) {
    if (typeof currency !== "string" || currency.trim().length !== 3) {
      return next(new ApiError(400, "Currency must be a valid 3-letter code (e.g., PKR, USD)"));
    }
    req.body.currency = currency.trim().toUpperCase();
  }

  // 5. Tax Percentage Validation (Must be a valid number >= 0)
  if (tax_percentage !== undefined) {
    if (isNaN(tax_percentage) || Number(tax_percentage) < 0) {
      return next(new ApiError(400, "Tax percentage must be a valid positive number"));
    }
  }

  // 6. Allow Online Booking Validation (Must be boolean or 0/1)
  if (allow_online_booking !== undefined) {
    if (typeof allow_online_booking !== "boolean" && allow_online_booking !== 0 && allow_online_booking !== 1) {
      return next(new ApiError(400, "Allow online booking must be a boolean value"));
    }
  }

  // 7. Cancellation Hours Limit Validation
  if (cancellation_hours_limit !== undefined) {
    if (isNaN(cancellation_hours_limit) || Number(cancellation_hours_limit) < 0) {
      return next(new ApiError(400, "Cancellation hours limit must be a valid number"));
    }
  }

  // 8. Address Validation
  // 8. Address Validation (Allow string, null, or empty)
  if (address !== undefined) {
    if (address !== null && typeof address !== "string") {
      return next(new ApiError(400, "Address must be a valid string"));
    }
    // Agar null ho toh null rehne dein, warna trim kar dein
    req.body.address = address !== null ? address.trim() : null;
  }

  next();
};