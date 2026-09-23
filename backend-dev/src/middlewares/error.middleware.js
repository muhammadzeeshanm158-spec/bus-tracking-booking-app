/**
 * @file error.middleware.js
 * @description Centralized Express Global Error Handling Middleware (ES6)
 * Intercepts all errors passed down through next(err), differentiates between custom operational 
 * API errors, database constraint violations (MySQL duplicate entries), and unhandled server errors.
 */

// Custom API Error class for application-level operational errors (Custom errors ke liye)
import ApiError from "../utils/ApiError.js";

/**
 * @desc    Express error handling middleware function
 * @param   {Error|ApiError} err - Error object received from next(err)
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @param   {import('express').NextFunction} next - Express next middleware function
 * @returns {import('express').Response} Standardized JSON error response
 */
const errorHandler = (err, req, res, next) => {
  // Server ke console mein debugging ke liye mukammal error details print kar rahe hain
  console.error("error", err);

  // Case 1: Handled custom operational errors (Jese ke validation, unauthorized, 404, ya bad request)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } 
  // Case 2: MySQL database unique constraint key conflict (Jese duplicate email ya username ki entry par error aana)
  else if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "Duplicate record already exists",
    });
  } 
  // Case 3: Unhandled server exception fallback (Agar koi unexpected technical error aa jaye toh user ko raw code expose na ho)
  else {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Error middleware ko export kar rahe hain taaki Express app mein central level par register (app.use) kiya ja sakay
export default errorHandler;