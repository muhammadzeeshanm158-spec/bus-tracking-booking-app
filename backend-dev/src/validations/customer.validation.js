/**
 * @file customerValidation.middleware.js
 * @description Express Middleware for Customer Request Payload Validation (ES6)
 */

import ApiError from "../utils/ApiError.js";

/**
 * Validates and sanitizes customer creation & update payloads
 */
export const createCustomerValidation = (req, res, next) => {
  try {
    // Frontend se 'name' aaye toh usay 'first_name' aur 'last_name' mein map kar dein
    if (!req.body.first_name && req.body.name) {
      const parts = req.body.name.trim().split(' ');
      req.body.first_name = parts[0];
      if (!req.body.last_name && parts.length > 1) {
        req.body.last_name = parts.slice(1).join(' ');
      }
    }

    // Phone number mapping (agar phone_number aaye toh phone mein daal dein)
    if (!req.body.phone && req.body.phone_number) {
      req.body.phone = req.body.phone_number;
    }

    // Status mapping (agar status active/inactive aaye toh is_active boolean set kar dein)
    if (req.body.status !== undefined && req.body.is_active === undefined) {
      req.body.is_active = req.body.status === 'active' || req.body.status === 'Active' || req.body.status === true;
    }

    // Validation check for first_name
    if (!req.body.first_name) {
      throw new ApiError(400, "First name is required");
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Update customer validation ke liye bhi same create validation function use ho raha hai
export const updateCustomerValidation = createCustomerValidation;