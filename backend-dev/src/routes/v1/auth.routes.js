/**
 * @file auth.routes.js
 * @description Express Router for Authentication Operations
 * Defines public endpoints for user registration and login (with request body validation),
 * as well as protected endpoints like profile retrieval requiring JWT authentication.
 */

import express from 'express';

// Authentication middleware jo protected routes ko secure karta hai
import {authMiddleware} from '../../middlewares/auth.middleware.js';

// Auth controller handlers jo request process karte hain
import {
  registerController,
  loginController,
  profileController,
} from '../../controllers/auth.controller.js';

// Request payload validation middlewares jo data ko check karte hain
import {
  registerValidation,
  loginValidation,
} from '../../validations/auth.validation.js';

const router = express.Router();

// Debugging ke liye check kar rahe hain ke saari validations aur controllers properly import hue hain ya nahi
console.log("registerValidation:", typeof registerValidation);
console.log("loginValidation:", typeof loginValidation);

console.log("registerController:", typeof registerController);
console.log("loginController:", typeof loginController);
console.log("profileController:", typeof profileController);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 * @middleware registerValidation - Validates required registration fields (e.g., email, password, name)
 */
router.post("/register", registerValidation, registerController);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials and return JWT token
 * @access  Public
 * @middleware loginValidation - Validates login input format before controller execution
 */
router.post("/login", loginValidation, loginController);

/**
 * @route   GET /api/auth/profile
 * @desc    Fetch authenticated user's profile details
 * @access  Private (Requires valid JWT in Authorization header)
 * @middleware authMiddleware - Verifies JWT signature and attaches user context to req.user
 */
router.get("/profile", authMiddleware, profileController);

// Router instance ko export kar rahe hain taaki main Express application mein mount ho sakay
export default router;