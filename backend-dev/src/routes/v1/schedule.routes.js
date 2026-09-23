/**
 * @file schedule.routes.js
 * @description Express Router for Bus/Travel Schedule Management
 */

import express from "express";

// Role Constants (System roles define karne ke liye, jaise Admin)
import { ROLES } from "../../constants/roles.js";

// Request payload validation middlewares for schedules (Schedule data ko validate karne ke liye)
import {
  createScheduleValidation,
  updateScheduleValidation,
} from "../../validations/schedule.validation.js";

// Schedule management controller handlers (Schedule operations ki logic handle karne ke liye)
import {
  getAllSchedulesController,
  getScheduleByIdController,
  updateScheduleController,
  createScheduleController,
  deleteScheduleController,
} from "../../controllers/schedule.controller.js";

// Auth and RBAC Middlewares (Authentication aur Role-based Access Control ke liye)
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = express.Router();

// Public Read Endpoints (Yeh endpoints aam hain, inke liye login hona lazmi nahi hai)
router.get("/", getAllSchedulesController);      // Sare active travel schedules ki list lene ke liye
router.get("/:id", getScheduleByIdController);   // ID ke zariye specific schedule ki details lene ke liye

// Protected Admin Write Endpoints (Yeh endpoints sirf authenticated aur Admin role wale users ke liye hain)
router.post(
  "/",
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  createScheduleValidation,
  createScheduleController
); // Naya travel schedule create karne ke liye

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  updateScheduleValidation,
  updateScheduleController
); // ID ke zariye existing schedule update karne ke liye

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  deleteScheduleController
); // ID ke zariye schedule delete ya cancel karne ke liye

// Export router instance (Router ko main application mein use karne ke liye export kar rahe hain)
export default router;