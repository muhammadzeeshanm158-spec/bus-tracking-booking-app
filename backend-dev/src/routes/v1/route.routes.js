/**
 * @file route.routes.js
 * @description Express Router for Travel Route Management (ES6)
 */

import express from "express";

// Role-based access control middleware import kar rahe hain
import { roleMiddleware } from "../../middlewares/role.middleware.js";

// System role constants import kar rahe hain (jaise ADMIN)
import { ROLES } from "../../constants/roles.js";

// Route validation middleware import kar rahe hain input check karne ke liye
import { createRouteValidation } from "../../validations/route.validation.js";

// Travel route ke controllers import kar rahe hain jo request handle karenge
import {
  createRouteController,
  getAllRoutesController,
  getRouteByIdController,
  updateRouteController,
  deleteRouteController,
} from "../../controllers/route.controller.js";

// Authentication middleware import kar rahe hain user ko verify karne ke liye
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public Read Endpoints (Yeh routes aam hain, inke liye login ya admin hona zaroori nahi hai)
router.get("/", getAllRoutesController);           // Sare travel routes ki list lene ke liye
router.get("/:id", getRouteByIdController);       // ID ke zariye specific route ki details lene ke liye

// Protected Admin Write Endpoints (Yeh routes sirf authenticated aur Admin role wale users ke liye hain)
router.post("/", authMiddleware, roleMiddleware([ROLES.ADMIN]), createRouteValidation, createRouteController); // Naya route create karne ke liye
router.put("/:id", authMiddleware, roleMiddleware([ROLES.ADMIN]), updateRouteController);                      // ID ke zariye route update karne ke liye
router.delete("/:id", authMiddleware, roleMiddleware([ROLES.ADMIN]), deleteRouteController);                   // ID ke zariye route delete karne ke liye

// Router instance ko export kar rahe hain taaki main application mein mount ho sakay
export default router;