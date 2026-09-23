/**
 * @file bus.controller.js
 * @description Express Controller Handlers for Bus Fleet Management (Raw MySQL + ES6)
 */

import BusModel from '../models/bus.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import HTTP_STATUS from '../utils/httpStatus.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * @desc    Create a new bus
 * @route   POST /api/buses
 */
export const createBusController = asyncHandler(async (req, res) => {
  const insertId = await BusModel.create(req.body);
  const newBus = await BusModel.findById(insertId);
  
  return successResponse(res, "Bus created successfully", newBus, HTTP_STATUS.CREATED);
});

/**
 * @desc    Get all buses
 * @route   GET /api/buses
 */
export const getAllBusesController = asyncHandler(async (req, res) => {
  const result = await BusModel.findAll();
  return successResponse(res, "Buses retrieved successfully", result, HTTP_STATUS.OK);
});

/**
 * @desc    Get bus by ID
 * @route   GET /api/buses/:id
 */
export const getBusByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await BusModel.findById(id);

  if (!result) {
    return errorResponse(res, 'Bus not found', HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(res, "Bus details retrieved successfully", result, HTTP_STATUS.OK);
});

/**
 * @desc    Update bus details
 * @route   PUT /api/buses/:id
 */
export const updateBusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const affectedRows = await BusModel.update(id, req.body);

  if (affectedRows === 0) {
    return errorResponse(res, 'Bus not found or no changes made', HTTP_STATUS.NOT_FOUND);
  }

  const updatedBus = await BusModel.findById(id);
  return successResponse(res, "Bus details updated successfully", updatedBus, HTTP_STATUS.OK);
});

/**
 * @desc    Delete a bus
 * @route   DELETE /api/buses/:id
 */
export const deleteBusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const affectedRows = await BusModel.delete(id);

  if (affectedRows === 0) {
    return errorResponse(res, 'Bus not found', HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(res, "Bus deleted successfully", null, HTTP_STATUS.OK);
});

/**
 * @desc    Search buses by keyword
 * @route   GET /api/buses/search?keyword=...
 */
export const searchBusesController = asyncHandler(async (req, res) => {
  const { keyword } = req.query;
  const result = keyword ? await BusModel.search(keyword) : await BusModel.findAll();
  
  return successResponse(res, "Search results retrieved successfully", result, HTTP_STATUS.OK);
});

/**
 * @desc    Get paginated buses
 * @route   GET /api/buses/paginated?page=1&limit=10
 */
export const getPaginatedBusesController = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const { totalBuses, buses } = await BusModel.getPaginated(limit, offset);

  const result = {
    buses,
    currentPage: page,
    totalPages: Math.ceil(totalBuses / limit) || 1,
    totalBuses,
  };

  return successResponse(res, "Paginated buses retrieved successfully", result, HTTP_STATUS.OK);
});