/**
 * @file driver.routes.js
 * @description Driver Management Routes (ES6)
 * Handles endpoints for fetching and managing driver records.
 */

import express from 'express';
import DriverController from '../../controllers/driver.controller.js';
import { createDriverValidation, updateDriverValidation, deleteDriverValidation } from '../../validations/driver.validation.js';

const router = express.Router();

/**
 * @route   GET /api/drivers
 * @desc    Fetch all drivers joined with user details
 * @access  Public / Protected (Depending on your auth middleware)
 */
router.get('/', DriverController.getDrivers);

/**
 * @route   GET /api/drivers/:id
 * @desc    Get a single driver profile by ID along with user details
 * @access  Private
 */
router.get('/:id', DriverController.getDriverById);

/**
 * @route   POST /api/drivers
 * @desc    Create a new driver profile
 * @access  Private
 */ 
router.post('/', createDriverValidation,DriverController.createDriver);

/**
 * @route   PUT /api/drivers/:id
 * @desc    Update driver details
 * @access  Private
 */
router.put('/:id', updateDriverValidation, DriverController.updateDriver);
router.delete('/:id', deleteDriverValidation, DriverController.deleteDriver);

export default router;