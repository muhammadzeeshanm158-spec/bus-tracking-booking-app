/**
 * @file profileController.js
 * @description User profile ko fetch aur update karne ki business logic with WebSockets (MySQL + ES6 + Async/Await)
 */

import UserModel from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/response.js';
import HTTP_STATUS from '../utils/httpStatus.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : req.query.userId; 

  if (!userId) {
    return errorResponse(res, "Unauthorized or missing user ID", HTTP_STATUS.UNAUTHORIZED);
  }

  const user = await UserModel.findById(userId);
  
  if (!user) {
    return errorResponse(res, "User not found", HTTP_STATUS.NOT_FOUND);
  }

  const { password, ...userProfile } = user;
  userProfile.role = user.role_name || (user.role_id === 1 ? 'admin' : user.role_id === 2 ? 'driver' : 'customer');

  return successResponse(res, "Profile fetched successfully", userProfile, HTTP_STATUS.OK);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : req.body.userId;
  const { full_name, email, phone_number, gender } = req.body;

  if (!userId) {
    return errorResponse(res, "Unauthorized or missing user ID", HTTP_STATUS.UNAUTHORIZED);
  }

  const updated = await UserModel.update(userId, {
    full_name,
    email,
    phone_number,
    gender
  });

  if (!updated) {
    return errorResponse(res, "User not found or update failed", HTTP_STATUS.NOT_FOUND);
  }

  const updatedUser = await UserModel.findById(userId);
  const cleanProfile = { ...updatedUser };
  delete cleanProfile.password;

  // --- WEBSOCKET TRIGGER ---
  // Profile update hone par specific user ke personal room ko live sync event bhejna
  const io = req.app.get("io");
  if (io) {
    io.to(`user_${userId}`).emit('profile_synced', {
      success: true,
      user: cleanProfile,
      message: 'Your profile has been updated and synchronized.'
    });
  }

  return successResponse(res, "Profile updated successfully", cleanProfile, HTTP_STATUS.OK);
});