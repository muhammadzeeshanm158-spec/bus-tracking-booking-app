/**
 * @file booking.routes.js
 * @description Express Router for Booking Management (MySQL + ES6)
 */

import express from "express";

// Booking controllers import kar rahe hain jo request ko handle karenge
import {
  createBookingController,
  getBookingByIdController,
  updateBookingController,
  deleteBookingController,
  searchBookingsController,
  getPaginatedBookingsController,
} from "../../controllers/booking.controller.js";

// Booking validation middlewares import kar rahe hain data check karne ke liye
import {
  createBookingValidation,
  updateBookingValidation,
} from "../../validations/booking.validation.js";

// Optional: Auth middleware agar bookings ko secure/protected karna ho
// import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();

// 1. Static Routes (Yeh hamesha dynamic `/:id` route se pehle aane chahiye taaki Express conflict na kare)
router.post("/", createBookingValidation, createBookingController); // Nayi booking create karne ke liye
router.get("/search", searchBookingsController);                    // Bookings search karne ke liye
router.get("/", getPaginatedBookingsController);                    // Paginated bookings ki list nikalne ke liye

// 2. Dynamic ID Routes (Yeh specific booking ID par operations perform karte hain)
router.get("/:id", getBookingByIdController);                       // ID ke zariye single booking ki details lene ke liye
router.put("/:id", updateBookingValidation, updateBookingController); // ID ke zariye booking update karne ke liye
router.delete("/:id", deleteBookingController);                     // ID ke zariye booking cancel/delete karne ke liye

// Router instance ko export kar rahe hain taaki main app mein mount ho sakay
export default router;