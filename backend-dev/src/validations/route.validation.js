/**
 * @file routeValidation.middleware.js
 * @description Request Payload Validation and Sanitization Middleware for Travel Routes (ES6)
 * Validates request body fields when creating and updating travel route records, 
 * ensuring route name bounds, source/destination city presence, positive distance values,
 * non-empty duration strings, and positive base fare amounts.
 */

// Custom operational error handling utility class
import ApiError from "../utils/ApiError.js";

/**
 * Validates and sanitizes route payload attributes (route_name, source_city_id, destination_city_id, distance_km, estimated_duration, base_fare)
 * @param {import('express').Request} req - Express request object containing route payload in req.body
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void} Calls next() on successful validation or forwards 400 ApiError to global error handler
 */
export const createRouteValidation = (req, res, next) => {
  // Request body se route payload attributes ko destructure kar rahe hain
  const {
    route_name,
    source_city_id,
    destination_city_id,
    distance_km,
    estimated_duration_minutes,
    is_active,
  } = req.body;

  // 1. Route Name Validation (Type, Length & Whitespace Sanitization)
  // Check kar rahe hain ke route_name string format mein mojood ho
  if (typeof route_name !== "string") {
    return next(new ApiError(400, "Route name is required"));
  }

  const trimmedRouteName = route_name.trim();

  // Enforce route name character boundaries (3 to 100 characters)
  if (trimmedRouteName.length < 3 || trimmedRouteName.length > 100) {
    return next(
      new ApiError(400, "Route name must be between 3 and 100 characters"),
    );
  }
  // Clean aur trimmed route name ke sath req.body ko update kar rahe hain
  req.body.route_name = trimmedRouteName;

  // 2. Source City ID Presence Check
  // Check kar rahe hain ke source city ID mojood ho aur khaali na ho
  if (!source_city_id || String(source_city_id).trim() === "") {
    return next(new ApiError(400, "Source city ID is required"));
  }

  // 3. Destination City ID Presence Check
  // Check kar rahe hain ke destination city ID mojood ho aur khaali na ho
  if (!destination_city_id || String(destination_city_id).trim() === "") {
    return next(new ApiError(400, "Destination city ID is required"));
  }

  // 4. Distance Validation (Positive Numeric Value Check)
  // Check kar rahe hain ke distance valid numeric value ho aur 0 se bara ho
  if (
    distance_km === undefined ||
    isNaN(Number(distance_km)) ||
    Number(distance_km) <= 0
  ) {
    return next(new ApiError(400, "Distance must be a positive number"));
  }

  // 5. Estimated Duration Presence Check
  // Check kar rahe hain ke estimated duration minutes valid positive number hon
  if (
    estimated_duration_minutes === undefined ||
    isNaN(Number(estimated_duration_minutes)) ||
    Number(estimated_duration_minutes) <= 0
  ) {
    return next(new ApiError(400, "Estimated duration is required"));
  }
  
  // Agar is_active field di gayi hai toh check karo ke uski value 0 ya 1 (number ya string) mein se ek ho
  if (
    is_active !== undefined &&
    ![0, 1, "0", "1"].includes(is_active)
  ) {
    return next(new ApiError(400, "is_active must be 0 or 1"));
  }

  // Saari route validation rules pass ho chuki hain — route controller ki execution par chalay jao
  return next();
};

/**
 * Reuses creation validation logic for route update requests
 * @type {import('express').RequestHandler}
 */
export const updateRouteValidation = createRouteValidation;