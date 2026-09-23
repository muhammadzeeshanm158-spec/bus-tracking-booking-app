/**
 * @file ApiError.js
 * @description Custom Operational API Error Class (ES6)
 */

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Descriptive error message
   * @param {string} [stack=""] - Optional stack trace override
   */
  constructor(statusCode, message, stack = "") {
    // Parent Error class ka constructor call kar rahe hain error message ke sath
    super(message);

    // HTTP status code assign kar rahe hain (jese 400, 404, 500)
    this.statusCode = statusCode;
    
    // Response success flag ko false set kar rahe hain kyunke yeh ek error hai
    this.success = false;
    
    // Yeh flag batata hai ke yeh ek operational/trusted error hai (na ke koi unexpected coding bug)
    this.isOperational = true;

    // Agar custom stack trace diya gaya hai toh woh set karo, warna V8 engine ka default stack trace capture kar lo
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Custom ApiError class ko export kar rahe hain taaki controllers aur error handler mein use ho sakay
export default ApiError;