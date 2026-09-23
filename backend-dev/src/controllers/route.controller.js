/**
 * @file route.controller.js
 * @description Express Controller Handlers for Travel Route Management (MySQL MVC + ES6)
 */

import Route from '../models/route.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import HTTP_STATUS from '../utils/httpStatus.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * @desc    Create a new travel route
 * @route   POST /api/routes
 */
export const createRouteController = asyncHandler(async (req, res) => {
  // Request body se data lekar database mein naya travel route create kar rahe hain
  const result = await Route.create(req.body);
  
  // Route successfully create hone par success response bhej rahe hain
  return successResponse(res, "Route created successfully", result, HTTP_STATUS.CREATED);
});

/**
 * @desc    Get all travel routes with optional source/destination filters
 * @route   GET /api/routes
 */
export const getAllRoutesController = asyncHandler(async (req, res) => {
  // Query parameters se source aur destination nikal rahe hain filtering ke liye
  const { source, destination } = req.query;

  // Database se routes fetch kar rahe hain (filters pass karke)
  const result = await Route.getAll({ source, destination });
  return successResponse(res, "Routes fetched successfully", result, HTTP_STATUS.OK);
});

/**
 * @desc    Get travel route by ID
 * @route   GET /api/routes/:id
 */
export const getRouteByIdController = asyncHandler(async (req, res) => {
  // URL parameters se route ki ID nikal kar database mein talaash kar rahe hain
  const { id } = req.params;
  const result = await Route.getById(id);

  // Agar route nahi milta toh 404 error response return kar do
  if (!result) {
    return errorResponse(res, 'Route not found', HTTP_STATUS.NOT_FOUND);
  }

  // Route milne par success response bhej do
  return successResponse(res, "Route details fetched successfully", result, HTTP_STATUS.OK);
});

/**
 * @desc    Update travel route details
 * @route   PUT /api/routes/:id
 */
export const updateRouteController = asyncHandler(async (req, res) => {
  // URL params se ID nikal kar route details update kar rahe hain
  const { id } = req.params;
  const result = await Route.update(id, req.body);

  // Agar update karne ke liye route nahi mila toh error bhej do
  if (!result) {
    return errorResponse(res, 'Route not found', HTTP_STATUS.NOT_FOUND);
  }

  // Updated route data ke sath success response return kar do
  return successResponse(res, "Route updated successfully", result, HTTP_STATUS.OK);
});

/**
 * @desc    Delete a travel route
 * @route   DELETE /api/routes/:id
 */
export const deleteRouteController = asyncHandler(async (req, res) => {
  // URL params se ID nikal kar database se route delete kar rahe hain
  const { id } = req.params;
  const result = await Route.delete(id);

  // Agar route mojood nahi tha toh 404 error bhej do
  if (!result) {
    return errorResponse(res, 'Route not found', HTTP_STATUS.NOT_FOUND);
  }

  // Success response bhej do ke route delete ho chuka hai
  return successResponse(res, "Route deleted successfully", result, HTTP_STATUS.OK);
});