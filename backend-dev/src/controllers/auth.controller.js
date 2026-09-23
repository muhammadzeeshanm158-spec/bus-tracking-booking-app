/**
 * @file auth.controller.js
 * @description Express Controller Handlers for Authentication with WebSockets (Pure MVC + ES6)
 */

import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import HTTP_STATUS from "../utils/httpStatus.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * @desc    Handles new user registration requests
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerController = asyncHandler(async (req, res) => {
  const { full_name, email, phone_number, password, gender } = req.body;

  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    return errorResponse(res, "User already exists", HTTP_STATUS.BAD_REQUEST);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Security Hardening: Public registration default role (Customer = 3)
  const roleId = 3; 
  const userRole = "customer";

  const userId = await UserModel.create({
    full_name,
    email,
    phone_number,
    password: hashedPassword,
    gender,
    role_id: roleId,
  });

  const result = {
    id: userId,
    full_name: full_name,
    email,
    phone_number,
    gender,
    role_id: roleId,
    role: userRole,
  };

  return successResponse(res, "User registered successfully", result, HTTP_STATUS.CREATED);
});

/**
 * @desc    Handles user authentication and JWT token generation
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findByEmail(email);
  if (!user) {
    return errorResponse(res, "Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return errorResponse(res, "Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }

  const token = jwt.sign(
    { id: user.id, role_id: user.role_id },
    process.env.JWT_SECRET || "secretkey",
    { expiresIn: "1d" },
  );

 let userRole = "customer";
if (user.role_id === 1) {
  userRole = "admin";
} else if (user.role_id === 2) {
  userRole = "driver"; 
} else if (user.role_id === 3) {
  userRole = "customer"; 
}

  const result = {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id,
      role: userRole,
    },
  };

  return successResponse(res, "Login successful", result, HTTP_STATUS.OK);
});

/**
 * @desc    Retrieves profile information for current user (with WebSocket live trigger example)
 * @route   GET /api/v1/auth/profile
 * @access  Private
 */
export const profileController = asyncHandler(async (req, res) => {
  // WebSocket instance access karna app se
  const io = req.app.get("io");
  
  if (io && req.user && req.user.id) {
    // Agar zaroorat ho toh profile fetch hone par user ke personal room par live notification bhej sakte hain
    io.to(`user_${req.user.id}`).emit("profile_synced", {
      message: "Profile data fetched and synced via WebSocket."
    });
  }

  return successResponse(res, "Profile fetched successfully", req.user, HTTP_STATUS.OK);
});