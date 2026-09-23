/**
 * @file profileRoutes.js
 * @description Yeh file Profile module ke saare API endpoints define karti hai (Pure MVC + ES6)
 */

import express from 'express';
import { getProfile, updateProfile } from '../../controllers/profile.controller.js';
import updateProfileValidation from '../../validations/profile.validation.js'; //  Validation  import kiya
// import { verifyToken } from '../middlewares/authMiddleware.js'; // Agar future mein JWT auth middleware lagana ho toh yahan import karein

// Express ka router instance create kar rahe hain taaki routes ko modular tarike se define kar sakein
const router = express.Router();

/**
 * @route   GET /api/profile
 * @desc    User ki profile details fetch karne ke liye route
 */
router.get('/', getProfile);      

/**
 * @route   PUT /api/profile
 * @desc    User ki profile details ko update karne ke liye route
 */
router.put('/', updateProfileValidation, updateProfile);    //  Yahan validation middleware insert kar diya hai

// Is router ko export kar rahe hain taaki main server file (app.js / server.js) mein mount kiya ja sake
export default router;