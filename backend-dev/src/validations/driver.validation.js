/**
 * @file driverValidation.middleware.js
 * @description Request Payload Validation Middleware for Driver Management (ES6)
 * Strictly aligned with MySQL Table Schema for Drivers (Linked with users table).
 */

// Custom operational error handler class
import ApiError from "../utils/ApiError.js";

/**
 * Validates driver creation payload attributes based on DB schema constraints
 * (Naya driver create karte waqt data ko validate karne ke liye middleware)
 */
export const createDriverValidation = (req, res, next) => {
  const {
    user_id,
    license_number,
    experience_years,
    joining_date,
    is_available,
  } = req.body;

  // 1. User ID Validation (INT, Required, Positive)
  // Check kar rahe hain ke user_id valid positive integer ho (kyunki driver users table se linked hai)
  const userId = Number(user_id);
  if (!user_id || isNaN(userId) || userId <= 0) {
    return next(new ApiError(400, "User ID is required and must be a valid positive number"));
  }

  // 2. License Number Validation (VARCHAR(100), Required, Unique)
  // Check kar rahe hain ke license number mojood ho aur string format mein ho
  if (!license_number || typeof license_number !== "string" || license_number.trim() === "") {
    return next(new ApiError(400, "License number is required"));
  }

  const trimmedLicense = license_number.trim();
  if (trimmedLicense.length < 3 || trimmedLicense.length > 100) {
    return next(
      new ApiError(400, "License number must be between 3 and 100 characters")
    );
  }

  // 3. Experience Years Validation (INT, Optional, Default 0, Non-negative)
  // Agar experience diya gaya hai toh check karo ke valid number ho aur negative na ho
  if (experience_years !== undefined && experience_years !== null && experience_years !== "") {
    const expYears = Number(experience_years);
    if (isNaN(expYears) || expYears < 0) {
      return next(new ApiError(400, "Experience years must be a valid non-negative number"));
    }
  }

  // 4. Joining Date Validation (DATE, Required)
  // Check kar rahe hain ke joining date di gayi ho aur valid date format mein ho
  if (!joining_date) {
    return next(new ApiError(400, "Joining date is required"));
  }
  
  const parsedDate = new Date(joining_date);
  if (isNaN(parsedDate.getTime())) {
    return next(new ApiError(400, "Joining date must be a valid date format"));
  }

  // 5. Is Available Validation (TINYINT / BOOLEAN, Optional)
  // Agar is_available diya gaya hai toh boolean ya valid flag hona chahiye
  if (is_available !== undefined && is_available !== null) {
    if (typeof is_available !== "boolean" && is_available !== 0 && is_available !== 1 && is_available !== "0" && is_available !== "1") {
      return next(new ApiError(400, "Is available status must be a boolean value"));
    }
  }

  // Saari validations pass hone par aglay middleware ya controller par chalay jao
  next();
};

/**
 * Validates partial updates for drivers
 * (Driver update karte waqt fields ko partially validate karne ke liye middleware)
 */
export const updateDriverValidation = (req, res, next) => {
  const {
    user_id,
    license_number,
    experience_years,
    joining_date,
    is_available,
  } = req.body;

  // Agar user_id bheja gaya hai toh check karo ke valid positive number ho
  if (user_id !== undefined) {
    const userId = Number(user_id);
    if (isNaN(userId) || userId <= 0) {
      return next(new ApiError(400, "User ID must be a valid positive number"));
    }
  }

  // Agar license_number bheja gaya hai toh length validate karo
  if (license_number !== undefined) {
    if (typeof license_number !== "string" || license_number.trim().length < 3 || license_number.trim().length > 100) {
      return next(new ApiError(400, "License number must be between 3 and 100 characters"));
    }
  }

  // Agar experience_years bheja gaya hai toh non-negative check karo
  if (experience_years !== undefined && experience_years !== null) {
    const expYears = Number(experience_years);
    if (isNaN(expYears) || expYears < 0) {
      return next(new ApiError(400, "Experience years must be a valid non-negative number"));
    }
  }

  // Agar joining_date bheja gaya hai toh valid date format check karo
  if (joining_date !== undefined && joining_date !== null && String(joining_date).trim() !== "") {
    if (isNaN(new Date(joining_date).getTime())) {
      return next(new ApiError(400, "Joining date must be a valid date format"));
    }
  }

  // Agar is_available bheja gaya hai toh valid check karo
  if (is_available !== undefined && is_available !== null) {
    if (typeof is_available !== "boolean" && is_available !== 0 && is_available !== 1 && is_available !== "0" && is_available !== "1") {
      return next(new ApiError(400, "Is available status must be a boolean value"));
    }
  }

  // Sabhi update validations pass hone ke baad aglay step par move karo
  next();



  
};

/**
 * Validates driver ID for deletion
 */
export const deleteDriverValidation = (req, res, next) => {
  const { id } = req.params;
  const driverId = Number(id);

  if (!id || isNaN(driverId) || driverId <= 0) {
    return next(new ApiError(400, "Invalid driver ID specified for deletion"));
  }

  next();
};