/**
 * @file trackingValidation.middleware.js
 * @description Express Middleware for Tracking Payload Validation (ES6)
 */

import ApiError from "../utils/ApiError.js";

/**
 * Validates and sanitizes bus tracking telemetry updates
 */
export const updateTrackingValidation = (req, res, next) => {
  const { bus_id, speed_kmh, status, latitude, longitude } = req.body;

  // 1. Bus ID Validation
  if (!bus_id) {
    return next(new ApiError(400, "Bus ID is required for tracking update"));
  }

  // 2. Speed Validation & Conversion
  if (speed_kmh !== undefined && speed_kmh !== null) {
    if (isNaN(Number(speed_kmh)) || Number(speed_kmh) < 0) {
      return next(new ApiError(400, "Speed must be a valid non-negative number"));
    }
    req.body.speed_kmh = Number(speed_kmh);
  }

  // 3. Status Validation & Sanitization
  if (status) {
    if (typeof status !== "string") {
      return next(new ApiError(400, "Status must be a valid string"));
    }
    req.body.status = status.trim();
  }

  // 4. Latitude Validation (-90 to 90)
  if (latitude !== undefined && latitude !== null) {
    if (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90) {
      return next(new ApiError(400, "Latitude must be a valid number between -90 and 90"));
    }
    req.body.latitude = Number(latitude);
  }

  // 5. Longitude Validation (-180 to 180)
  if (longitude !== undefined && longitude !== null) {
    if (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180) {
      return next(new ApiError(400, "Longitude must be a valid number between -180 and 180"));
    }
    req.body.longitude = Number(longitude);
  }

  next();
};

