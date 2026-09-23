/**
 * @file responseHandler.js
 * @description Standardized API Response Formatting Utilities (ES6)
 */

import HTTP_STATUS from "./httpStatus.js";

/**
 * Sends a standardized JSON HTTP response payload
 */
export const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};

/**
 * Helper function for formatting and sending success responses (Default: 200 OK)
 * @param {import('express').Response} res
 * @param {string} message - Success message
 * @param {*} [data=null] - Payload data
 * @param {number} [statusCode=200] - Status code
 */
export const successResponse = (res, message, data = null, statusCode = HTTP_STATUS.OK) => {
  return sendResponse(res, statusCode, true, message, data);
};

/**
 * Helper function for formatting and sending error responses (Default: 500 Internal Error)
 * @param {import('express').Response} res
 * @param {string} message - Error message
 * @param {number} [statusCode=500] - Status code
 * @param {*} [errors=null] - Extra validation errors or stack trace details
 */
export const errorResponse = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};