/**
 * @file bus.routes.js
 * @description Express Router for Bus Fleet Operations (ES6)
 */

import express from "express";

// Role Constants (System roles define karne ke liye, jaise Admin)
import { ROLES } from "../../constants/roles.js";

// Middlewares (Authentication aur Role-based Access Control ke liye)
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

// Request Validations (Bus data ke input ko check karne ke liye validation rules)
import {
  createBusValidation,
  updateBusValidation,
} from "../../validations/bus.validation.js";

// Controller Handlers (Bus operations ki business logic handle karne ke liye)
import {
  createBusController,
  searchBusesController,
  getBusByIdController,
  updateBusController,
  deleteBusController,
  getAllBusesController,
  getPaginatedBusesController,
} from "../../controllers/bus.controller.js";

const router = express.Router();

// 1. Static Routes (Yeh hamesha dynamic `/:id` route se pehle aane chahiye taaki Express path clash na kare)
// Yeh tamam routes sirf Admin role wale users ke liye accessible hain (authMiddleware + roleMiddleware ke zariye)
router.post("/", authMiddleware, roleMiddleware([ROLES.ADMIN]), createBusValidation, createBusController);         // Nayi bus add karne ke liye
router.get("/search", authMiddleware, roleMiddleware([ROLES.ADMIN]), searchBusesController);                             // Buses search karne ke liye
router.get("/paginated", authMiddleware, roleMiddleware([ROLES.ADMIN]), getPaginatedBusesController);           // Paginated buses ki list lene ke liye
router.get("/", authMiddleware, roleMiddleware([ROLES.ADMIN]), getAllBusesController);                                   // Sari buses ki list lene ke liye

// 2. Dynamic Parameterized Routes (Yeh specific bus ID par operations perform karte hain)
router.get("/:id", authMiddleware, roleMiddleware([ROLES.ADMIN]), getBusByIdController);                                 // ID ke zariye single bus ki details lene ke liye
router.put("/:id", authMiddleware, roleMiddleware([ROLES.ADMIN]), updateBusValidation, updateBusController);     // ID ke zariye bus details update karne ke liye
router.delete("/:id", authMiddleware, roleMiddleware([ROLES.ADMIN]), deleteBusController);                               // ID ke zariye bus delete karne ke liye

// Router instance ko export kar rahe hain taaki main application mein mount ho sakay
export default router;