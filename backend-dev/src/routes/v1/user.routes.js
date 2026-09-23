/**
 * @file user.routes.js
 * @description Express Router for User Management Operations (ES6)
 */

import express from "express";
const router = express.Router();

// Role Constants (System roles define karne ke liye, jaise Admin)
import { ROLES } from "../../constants/roles.js";

// Middlewares (User authentication aur role-based access control ke liye)
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

// Validations & Controllers (User data validation aur account management ki logic ke liye)
import { updateUserValidation } from "../../validations/user.validation.js";
import {
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
} from "../../controllers/user.controller.js";

// Protected Admin Routes (Yeh tamam routes sirf authenticated aur Admin role wale users ke liye accessible hain)
router.get("/", authMiddleware, roleMiddleware([ROLES.ADMIN]), getAllUsersController);                  // Sari users ki list (with filters/pagination) lene ke liye
router.get("/:id", authMiddleware, roleMiddleware([ROLES.ADMIN]), getUserByIdController);              // ID ke zariye specific user ki profile details lene ke liye
router.put("/:id", authMiddleware, roleMiddleware([ROLES.ADMIN]), updateUserValidation, updateUserController); // ID ke zariye user account details update karne ke liye
router.delete("/:id", authMiddleware, roleMiddleware([ROLES.ADMIN]), deleteUserController);            // ID ke zariye user account delete karne ke liye (self-deletion protection ke sath)

// Router instance ko export kar rahe hain taaki main application mein mount ho sakay
export default router;