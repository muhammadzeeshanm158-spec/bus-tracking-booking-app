/**
 * @file busValidation.middleware.js
 * @description Express Middleware for Bus Request Payload Validation (ES6)
 */

import ApiError from "../utils/ApiError.js";

/**
 * Validates and sanitizes bus creation & update payloads
 * (Bus create ya update karte waqt incoming data ko validate aur clean karne ke liye middleware)
 */
export const createBusValidation = (req, res, next) => {
  const { bus_name, bus_type, registration_number, total_seats } = req.body;

  // 1. Bus Name Validation & Sanitization (Check karo ke bus name mojood ho aur 3 se 50 characters ke darmiyan ho)
  if (!bus_name || typeof bus_name !== "string") {
    return next(new ApiError(400, "Bus name is required"));
  }
  const trimmedBusName = bus_name.trim();
  if (trimmedBusName.length < 3 || trimmedBusName.length > 50) {
    return next(new ApiError(400, "Bus name must be between 3 and 50 characters"));
  }
  req.body.bus_name = trimmedBusName; // 💡 Clean string ke sath req.body ko update kar rahe hain

  // 2. Bus Type Validation & Sanitization (Check karo ke bus type mojood ho)
  if (!bus_type || typeof bus_type !== "string") {
    return next(new ApiError(400, "Bus type is required"));
  }
  const trimmedBusType = bus_type.trim();
  if (trimmedBusType.length < 3 || trimmedBusType.length > 50) {
    return next(new ApiError(400, "Bus type must be between 3 and 50 characters"));
  }
  req.body.bus_type = trimmedBusType; // 💡 Clean string ke sath req.body ko update kar rahe hain

  // 3. Registration Number Validation & Sanitization (Check karo ke vehicle registration number valid aur required ho)
  if (!registration_number || typeof registration_number !== "string") {
    return next(new ApiError(400, "Registration number is required"));
  }
  const trimmedReg = registration_number.trim();
  if (trimmedReg.length < 3 || trimmedReg.length > 50) {
    return next(new ApiError(400, "Registration number must be between 3 and 50 characters"));
  }
  req.body.registration_number = trimmedReg; // 💡 Clean string ke sath req.body ko update kar rahe hain

  // 4. Total Seats Validation & Conversion (Check karo ke total seats valid positive number hon)
  if (
    total_seats === undefined ||
    total_seats === null ||
    isNaN(Number(total_seats)) ||
    Number(total_seats) <= 0
  ) {
    return next(new ApiError(400, "Total seats must be a valid positive number"));
  }
  req.body.total_seats = Number(total_seats);

  // Payload mukammal taur par clean aur validated hai, aglay middleware ya controller par chalay jao
  next();
};

// Update bus validation ke liye bhi same create validation function use kar rahe hain
export const updateBusValidation = createBusValidation;