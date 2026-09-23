/**
 * @file logger.middleware.js
 * @description Express Request Logger Middleware (ES6)
 * Intercepts incoming HTTP requests, captures the localized current timestamp, 
 * logs the HTTP method and request URL to the console, and passes control to the next middleware.
 */

/**
 * @desc    Express middleware function to log incoming HTTP requests in real-time
 * @param   {import('express').Request} req - Express request object containing method and URL details
 * @param   {import('express').Response} res - Express response object
 * @param   {import('express').NextFunction} next - Express next function to continue request execution pipeline
 * @returns {void}
 */
const logger = (req, res, next) => {
  // Server ke local timezone ke mutabiq current date aur time capture kar rahe hain
  const currentTime = new Date().toLocaleString();

  // Console mein formatted timestamp ke sath HTTP method (jese GET, POST) aur request URL print kar rahe hain
  console.log(`[${currentTime}] ${req.method} ${req.originalUrl}`);

  // Request processing ko pipeline mein aglay middleware ya route handler ki taraf forward kar do
  next();
};

// Logger middleware function ko export kar rahe hain
export default logger;