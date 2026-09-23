/**
 * @file httpStatus.js
 * @description HTTP Response Status Code Dictionary (ES6)
 * Standardized dictionary of RFC-compliant HTTP status codes used across controllers,
 * middlewares, services, and error handlers for consistent REST API status reporting.
 */

/**
 * Standard HTTP status code dictionary
 * @readonly
 * @enum {number}
 */
const HTTP_STATUS = {
  /** 200 OK - Standard successful HTTP request response */
  OK: 200, // Request kamiyab ho gayi hai aur standard response bhej rahe hain

  /** 201 Created - Request succeeded and a new resource was created */
  CREATED: 201, // Request kamiyab rahi aur naya resource (jese user, schedule, booking) successfully create ho gaya hai

  /** 400 Bad Request - Server cannot process request due to client validation or syntax error */
  BAD_REQUEST: 400, // Client ki taraf se bheji gayi data validation galat hai, server process nahi kar sakta

  /** 401 Unauthorized - Authentication is required or JWT token is missing/invalid */
  UNAUTHORIZED: 401, // User login nahi hai ya uska authentication token missing ya invalid hai

  /** 403 Forbidden - Authenticated user lacks sufficient permissions (RBAC access restriction) */
  FORBIDDEN: 403, // User login hai lekin uske paas yeh action perform karne ki permission (jaise Admin access) nahi hai

  /** 404 Not Found - Requested API route or database record could not be found */
  NOT_FOUND: 404, // Requested API route ya database record nahi mila

  /** 409 Conflict - Request conflicts with target resource state (e.g., duplicate email registration) */
  CONFLICT: 409, // Request current resource state se clash kar rahi hai (jese duplicate record ya email entry)

  /** 500 Internal Server Error - Generic error status for unhandled server/database exceptions */
  INTERNAL_SERVER_ERROR: 500, // Server ya database ki taraf se koi unexpected ya unhandled error aa gaya hai
};

// Export HTTP status codes dictionary for application-wide usage (Poori application mein uniform status codes use karne ke liye export kar rahe hain)
export default HTTP_STATUS;