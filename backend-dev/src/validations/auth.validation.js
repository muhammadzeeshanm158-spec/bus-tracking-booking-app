/**
 * @file auth.validation.js
 * @description Authentication Validation Middlewares (ES6) - Ensures robust payload validation for MySQL backend
 */

import ApiError from "../utils/ApiError.js";

/**
 * @desc    Validates registration request payload (Name, Email, Phone, Password, Gender)
 */
export const registerValidation = (req, res, next) => {
  const { full_name, email, phone_number, password, gender } = req.body;

  // 1. Name Validation (Check if name exists and length is between 3 and 150 characters)
  if (!full_name || typeof full_name !== "string") {
    return next(new ApiError(400, "Full name is required"));
  }
  const trimmedName = full_name.trim();
  if (trimmedName.length < 3 || trimmedName.length > 150) {
    return next(new ApiError(400, "Full name must be between 3 and 150 characters"));
  }

  // 2. Email Validation (Check if email is valid and does not exceed 255 characters)
  if (!email || typeof email !== "string") {
    return next(new ApiError(400, "Email is required"));
  }
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return next(new ApiError(400, "Invalid email format"));
  }
  if (trimmedEmail.length > 255) {
    return next(new ApiError(400, "Email must not exceed 255 characters"));
  }

  // 3. Phone Number Validation (Check if phone number contains 11 to 20 digits)
  if (!phone_number) {
    return next(new ApiError(400, "Phone number is required"));
  }
  const trimmedPhoneNumber = String(phone_number).trim();
  const phoneRegex = /^[0-9]{11,20}$/;
  if (!phoneRegex.test(trimmedPhoneNumber)) {
    return next(new ApiError(400, "Phone number must contain 11 to 20 digits"));
  }

  // 4. Password Validation (8-64 chars with uppercase, lowercase, number, and special character)
  if (!password || typeof password !== "string") {
    return next(new ApiError(400, "Password is required"));
  }
  const trimmedPassword = password.trim();
  if (trimmedPassword.length < 8 || trimmedPassword.length > 64) {
    return next(new ApiError(400, "Password must be between 8 and 64 characters"));
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]+$/;
  if (!passwordRegex.test(trimmedPassword)) {
    return next(new ApiError(400, "Password must contain uppercase, lowercase, number, and special character"));
  }

  // 5. Gender Validation (Check if gender matches allowed values)
  if (!gender || typeof gender !== "string") {
    return next(new ApiError(400, "Gender is required"));
  }
  const allowedGenders = ["Male", "Female", "Other"];
  if (!allowedGenders.includes(gender.trim())) {
    return next(new ApiError(400, "Gender must be Male, Female, or Other"));
  }

  // Agar saari validations pass ho jayein toh aglay middleware ya controller par chalay jao
  next();
}; 

/**
 * @desc    Validates login request payload (Email and Password)
 */
export const loginValidation = (req, res, next) => {
  const { email, password } = req.body;

  // 1. Email Validation (Check if email exists and format is correct)
  if (!email || typeof email !== "string") {
    return next(new ApiError(400, "Email is required"));
  }
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return next(new ApiError(400, "Invalid email format"));
  }

  // 2. Password Validation (Check if password field is provided)
  if (!password) {
    return next(new ApiError(400, "Password is required"));
  }

  // Login validations pass hone ke baad aglay step par move karo
  next();
};