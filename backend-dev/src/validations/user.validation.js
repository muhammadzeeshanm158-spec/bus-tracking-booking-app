/**
 * @file userValidation.middleware.js
 * @description Request Payload Validation Middleware for User Updates (ES6)
 */

import ApiError from "../utils/ApiError.js";

// User update request payload ko validate aur sanitize karne ke liye middleware
export const updateUserValidation = (req, res, next) => {
  const { full_name, phone_number, gender, account_status } = req.body;

  // 1. Full Name Validation (Agar full_name diya gaya hai toh length 3 se 150 characters ke darmiyan honi chahiye)
  if (full_name !== undefined) {
    const trimmedName = full_name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 150) {
      return next(new ApiError(400, "Full name must be between 3 and 150 characters"));
    }
    // Clean trimmed name ke sath req.body ko update kar rahe hain
    req.body.full_name = trimmedName;
  }

  // 2. Phone Number Validation (Agar phone_number diya gaya hai toh 11 se 20 digits aur sirf numbers hone chahiye)
  if (phone_number !== undefined) {
    const trimmedPhone = phone_number.trim();
    const phoneRegex = /^[0-9]{11,20}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      return next(new ApiError(400, "Phone number must be 11-20 digits and contain numbers only"));
    }
    // Clean phone number ke sath req.body ko update kar rahe hain
    req.body.phone_number = trimmedPhone;
  }

  // 3. Gender Validation (Agar gender diya gaya hai toh allowed list (Male, Female, Other) mein se hona chahiye)
  if (gender !== undefined) {
    const allowedGenders = ["Male", "Female", "Other"];
    if (!allowedGenders.includes(gender)) {
      return next(new ApiError(400, "Gender must be Male, Female or Other"));
    }
  }

  // 4. Account Status Validation (Agar account_status diya gaya hai toh active ya inactive hona chahiye)
  if (account_status !== undefined) {
    const allowedStatus = ["active", "inactive"];
    if (!allowedStatus.includes(account_status)) {
      return next(new ApiError(400, "Account status must be active or inactive"));
    }
  }

  // Sabhi user validation checks pass hone ke baad aglay middleware ya controller par chalay jao
  return next();
};

// User update validation middleware ko default export kar rahe hain
export default updateUserValidation;