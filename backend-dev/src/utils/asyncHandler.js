/**
 * @file asyncHandler.js
 * @description Higher-Order Function Wrapper for Express Asynchronous Route Handlers (ES6)
 * Wraps asynchronous controller/middleware functions to automatically catch pending promise 
 * rejections and pass them to the global Express error-handling middleware via `next()`.
 * Eliminates the need for repetitive try/catch blocks across route handlers.
 */

/**
 * Higher-order middleware wrapper for Express async functions
 * @param {Function} fn - Asynchronous Express route handler or middleware `(req, res, next)`
 * @returns {Function} Standard Express middleware function with automatic error catching
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Route handler ko execute karte hain, promise mein wrap karke catch karte hain, aur agar koi error aaye toh `next(err)` ke zariye global error handler ko forward kar dete hain
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Application ke baqi controllers mein bar bar try/catch likhne se bachne ke liye asyncHandler utility ko export kar rahe hain
export default asyncHandler;