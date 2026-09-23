/**
 * @file payment.routes.js
 * @description Express Router for Payment Management Operations (ES6) - Fully Validated & Protected
 */

import express from "express";

// Role Constants
import { ROLES } from "../../constants/roles.js";

// Middlewares
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { 
  createPaymentValidation, 
  updatePaymentValidation 
} from "../../validations/payment.validation.js";

// Payment Controllers
import {
  createPaymentController,
  getAllPaymentsController,
  getPaymentByIdController,
  updatePaymentController,
  deletePaymentController,
} from "../../controllers/payment.controller.js";

const router = express.Router();

// PROFESSIONAL FIX: POST route par Admin aur Customer dono ko allow kar diya hai
router.post("/", authMiddleware, roleMiddleware([ROLES.ADMIN, ROLES.CUSTOMER]), createPaymentValidation, createPaymentController);      

// Baaki Admin routes wese hi hain
router.get("/", authMiddleware, roleMiddleware([ROLES.ADMIN]), getAllPaymentsController);      
router.get("/:id", authMiddleware, roleMiddleware([ROLES.ADMIN]), getPaymentByIdController);   
router.put("/:id", authMiddleware, roleMiddleware([ROLES.ADMIN]), updatePaymentValidation, updatePaymentController);   
router.delete("/:id", authMiddleware, roleMiddleware([ROLES.ADMIN]), deletePaymentController); 

export default router;