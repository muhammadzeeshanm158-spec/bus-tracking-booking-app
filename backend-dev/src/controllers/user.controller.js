/**
 * @file user.controller.js
 * @description Express Controller Handlers for User Account Management (MySQL + ES6)
 */

import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import HTTP_STATUS from "../utils/httpStatus.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * @desc    Retrieve all users with basic search and filtering for MySQL
 * @route   GET /api/users
 * @access  Private (Admin)
 */
export const getAllUsersController = asyncHandler(async (req, res) => {
  const { search, role_id } = req.query;
  const users = await User.getAllFiltered({ search, role_id });
  return successResponse(res, "Users retrieved successfully", { users }, HTTP_STATUS.OK);
});

/**
 * @desc    Fetch details of a specific user profile by unique user ID
 * @route   GET /api/users/:id
 * @access  Private (Admin)
 */
export const getUserByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await User.findById(id);

  if (!result) {
    return errorResponse(res, "User not found", HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(res, "User details retrieved successfully", result, HTTP_STATUS.OK);
});

/**
 * @desc    Update information for an existing user account (Supports full profile or role update)
 * @route   PUT /api/users/:id
 * @access  Private (Admin)
 */
export const updateUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  // Pehle check karein user exist karta hai ya nahi
  const existingUser = await User.findById(id);
  if (!existingUser) {
    return errorResponse(res, "User not found", HTTP_STATUS.NOT_FOUND);
  }

  let affectedRows = 0;

  // Agar request mein sirf role aaya hai (Admin panel se Save Role click karne par)
  if (role !== undefined) {
    affectedRows = await User.updateRole(id, role);
  } else {
    // Agar poori profile update ho rahi hai
    affectedRows = await User.updateProfile(id, req.body);
  }
  
  if (affectedRows === 0) {
    return errorResponse(res, "No changes made or update failed", HTTP_STATUS.BAD_REQUEST);
  }

  const updatedUser = await User.findById(id);
  return successResponse(res, "User details updated successfully", updatedUser, HTTP_STATUS.OK);
});

/**
 * @desc    Delete a user account by ID with requesting user context
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
export const deleteUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requestingUserId = req.user?.userId;

  if (Number(id) === Number(requestingUserId)) {
    return errorResponse(res, "You cannot delete your own account", HTTP_STATUS.BAD_REQUEST);
  }

  const deleted = await User.deleteUser ? await User.deleteUser(id) : false;

  if (!deleted) {
    return errorResponse(res, "User not found or already deleted", HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(res, "User deleted successfully", null, HTTP_STATUS.OK);
});