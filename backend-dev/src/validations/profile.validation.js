/**
 * @file profileValidation.middleware.js
 * @description Request Payload Validation Middleware for Profile Updates (ES6)
 */

import ApiError from "../utils/ApiError.js";

// Profile update request payload ko validate aur sanitize karne ke liye middleware
export const updateProfileValidation = (req, res, next) => {
  const { full_name, email, phone_number, address } = req.body;

  // 1. Full Name Validation (Agar full_name diya gaya hai toh length 3 se 150 characters ke darmiyan honi chahiye)
  if (full_name !== undefined) {
    const trimmedName = full_name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 150) {
      return next(new ApiError(400, "Full name must be between 3 and 150 characters"));
    }
    // Clean trimmed name ke sath req.body ko update kar rahe hain
    req.body.full_name = trimmedName;
  }

  // 2. Email Validation (Agar email diya gaya hai toh proper email format hona chahiye)
  if (email !== undefined) {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return next(new ApiError(400, "Please provide a valid email address"));
    }
    // Clean email ke sath req.body ko update kar rahe hain
    req.body.email = trimmedEmail;
  }

  // 3. Phone Number Validation (Agar phone_number diya gaya hai toh valid digits hone chahiye)
  if (phone_number !== undefined) {
    const trimmedPhone = phone_number.trim();
    // Pakistani/International phone format check (10 se 15 digits)
    const phoneRegex = /^((\+92)|(0092)|(0))?3\d{9}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      return next(new ApiError(400, "Please provide a valid Pakistani phone number (e.g. 03001234567)"));
    }
    // Clean phone number ke sath req.body ko update kar rahe hain
    req.body.phone_number = trimmedPhone;
  }

  // 4. Address Validation (Agar address diya gaya hai toh maximum length check kar sakte hain)
  if (address !== undefined) {
    const trimmedAddress = address.trim();
    if (trimmedAddress.length > 255) {
      return next(new ApiError(400, "Address cannot exceed 255 characters"));
    }
    req.body.address = trimmedAddress;
  }

  // Sabhi profile validation checks pass hone ke baad aglay middleware ya controller par chalay jao
  return next();
};

// Profile update validation middleware ko default export kar rahe hain
export default updateProfileValidation;