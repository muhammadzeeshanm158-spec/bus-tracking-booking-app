/**
 * @file routes/v1/index.js
 * @description API Version 1 (v1) Master Router (ES6)
 * Aggregates and mounts all feature-specific sub-routes.
 */

import { Router } from "express";

// Import all sub-route modules (Tamam feature-specific route modules ko import kar rahe hain)
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import busRoutes from "./bus.routes.js";
import routeRoutes from "./route.routes.js";
import scheduleRoutes from "./schedule.routes.js";
import bookingRoutes from "./booking.routes.js";
import paymentRoutes from "./payment.routes.js";

const router = Router();

/**
 * @route   GET /api/v1/
 * @desc    API v1 Health Check / Status Route
 * @access  Public
 */
router.get("/", (req, res) => {
  // Check karne ke liye ke API v1 theek se kaam kar rahi hai ya nahi
  res.json({
    success: true,
    message: "API Version 1 Working Successfully",
  });
});

// Sub-Route Mount Points (Har module ke routes ko unke specific endpoints par mount kar rahe hain)
router.use("/auth", authRoutes);       // Authentication routes (e.g., /api/v1/auth/...) mount ho rahe hain
router.use("/users", userRoutes);      // User management routes mount ho rahe hain
router.use("/buses", busRoutes);       // Bus fleet management routes mount ho rahe hain
router.use("/routes", routeRoutes);    // Travel route management routes mount ho rahe hain
router.use("/schedules", scheduleRoutes); // Schedule management routes mount ho rahe hain
router.use("/bookings", bookingRoutes);   // Seat booking routes mount ho rahe hain
router.use("/payments", paymentRoutes);   // Payment transaction routes mount ho rahe hain

// Master router instance ko export kar rahe hain taaki main app mein `/api/v1` ke prefix par use ho sakay
export default router;