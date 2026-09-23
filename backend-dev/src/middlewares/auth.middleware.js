/**
 * @file auth.middleware.js
 * @description Express Authentication Middleware (ES6)
 */

import jwt from "jsonwebtoken";

/**
 * @desc    Express middleware function to protect routes using JWT authentication
 * @param   {import('express').Request} req - Express request object
 * @param   {import('express').Response} res - Express response object
 * @param   {import('express').NextFunction} next - Express next middleware function
 * @returns {void|import('express').Response} Passes execution to next middleware or returns 401 Unauthorized
 */
export const authMiddleware = (req, res, next) => {
  // Request headers se Authorization header nikal rahe hain (jese "Bearer <token>")
  const authHeader = req.headers.authorization;

  // Check kar rahe hain ke Authorization header mojood hai ya nahi
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is required",
    });
  }

  // "Bearer <token>" format ko split karke sirf token string alag kar rahe hain
  const token = authHeader.split(" ")[1];

  // Check kar rahe hain ke token properly extract hua hai ya nahi
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization token",
    });
  }

  try {
    // Environment variable ya default secret key se JWT token ko verify aur decode kar rahe hain
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    // Decoded user data (jese user id, role) ko Express request object (`req.user`) mein attach kar rahe hain
    req.user = decoded;

    // Aglay middleware ya route handler par execution pass kar do
    next();
  } catch (error) {
    // Agar token verification fail ho jaye (jese expire ho gaya ho ya invalid ho) toh error log karo
    console.log(error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};