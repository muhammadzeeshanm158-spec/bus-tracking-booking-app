/**
 * @file app.js
 * @description Express Application Configuration File (ES6)
 * Configures global middlewares, primary API routes, 404 fallback, and global error handling.
 */

import express from "express";
import cors from "cors";

// Custom Middlewares (Assuming app.js is inside /src folder)
import errorHandler from "./middlewares/error.middleware.js";
import logger from "./middlewares/logger.middleware.js";

// Routes Import
import settingRoutes from './routes/v1/setting.routes.js';
import trackingRoutes from './routes/v1/tracking.routes.js';
import reportRoutes from './routes/v1/reports.routes.js';
import profileRoutes from './routes/v1/profile.routes.js'; 
import customerRoutes from './routes/v1/customer.routes.js'; 
import driverRoutes from './routes/v1/driver.routes.js'; 
import routeRoutes from './routes/v1/route.routes.js';     
import bookingRoutes from './routes/v1/booking.routes.js'; 
import paymentRoutes from './routes/v1/payment.routes.js'; // Payment routes import (Tested & Added)



// Centralized API Routes
import routes from "./routes/index.js";

const app = express();

// Global Middlewares (Cross-Origin Resource Sharing aur JSON data parsing ko enable kar rahe hain)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mounting Tested Modules & Routes
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/tracking', trackingRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/profile', profileRoutes); 
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/drivers', driverRoutes); 
app.use('/api/v1/routes', routeRoutes);   
app.use('/api/v1/bookings', bookingRoutes); 
app.use('/api/v1/payments', paymentRoutes); // Mounted successfully!


// Custom Request Logger (Har incoming request ko terminal ya log file mein track karne ke liye)
app.use(logger);

// Base Landing Route / Healthcheck
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Bus Ticket Booking Backend API",
  });
});

// Primary API Router Mount
app.use("/api", routes);

// 404 Catch-All Middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route Not Found`,
  });
});

// Global Centralized Error Middleware
app.use(errorHandler);

export default app;