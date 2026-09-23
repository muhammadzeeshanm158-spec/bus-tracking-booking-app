/**
 * @file scheduleValidation.middleware.js
 * @description Request Payload Validation Middleware for Schedule Management (ES6)
 * Validates request body fields when creating and updating bus travel schedules,
 * enforcing relational ID checks, valid JavaScript Date parsing, dynamic chronological 
 * comparisons (arrival > departure), non-negative seat counts, and status whitelists.
 */

import ApiError from "../utils/ApiError.js";

/**
 * Validates creation payload for bus schedules
 */
export const createScheduleValidation = (req, res, next) => {
  // Support both camelCase and snake_case from request body
  const rawBusId = req.body.bus_id !== undefined ? req.body.bus_id : req.body.busId;
  const rawRouteId = req.body.route_id !== undefined ? req.body.route_id : req.body.routeId;
  const rawDriverId = req.body.driver_id !== undefined ? req.body.driver_id : req.body.driverId;
  const rawAvailableSeats = req.body.available_seats !== undefined ? req.body.available_seats : req.body.availableSeats;
  
  // Handle datetime or separate date/time strings from frontend
  let rawDeparture = req.body.departure_datetime || req.body.departureDatetime;
  if (!rawDeparture && req.body.departureDate && req.body.departureTime) {
    rawDeparture = `${req.body.departureDate}T${req.body.departureTime}`;
  }

  let rawArrival = req.body.arrival_datetime || req.body.arrivalDatetime;
  if (!rawArrival && req.body.departureDate && req.body.arrivalTime) {
    rawArrival = `${req.body.departureDate}T${req.body.arrivalTime}`;
  }

  const status = req.body.status;

  // 1. Bus ID Validation
  if (rawBusId === undefined || rawBusId === null || rawBusId === '') {
    return next(new ApiError(400, "Bus ID is required"));
  }
  const busId = Number(rawBusId);
  if (isNaN(busId) || busId <= 0) {
    return next(new ApiError(400, "Bus ID must be a valid number"));
  }

  // 2. Route ID Validation
  if (rawRouteId === undefined || rawRouteId === null || rawRouteId === '') {
    return next(new ApiError(400, "Route ID is required"));
  }
  const routeId = Number(rawRouteId);
  if (isNaN(routeId) || routeId <= 0) {
    return next(new ApiError(400, "Route ID must be a valid number"));
  }

  // 3. Driver ID Validation
  if (rawDriverId === undefined || rawDriverId === null || rawDriverId === '') {
    return next(new ApiError(400, "Driver ID is required"));
  }
  const driverId = Number(rawDriverId);
  if (isNaN(driverId) || driverId <= 0) {
    return next(new ApiError(400, "Driver ID must be a valid number"));
  }

  // 4. Departure Datetime Validation
  if (!rawDeparture) {
    return next(new ApiError(400, "Departure datetime is required"));
  }
  const departure = new Date(rawDeparture);
  if (isNaN(departure.getTime())) {
    return next(new ApiError(400, "Departure datetime must be a valid date"));
  }

  // 5. Arrival Datetime Validation
  if (!rawArrival) {
    return next(new ApiError(400, "Arrival datetime is required"));
  }
  const arrival = new Date(rawArrival);
  if (isNaN(arrival.getTime())) {
    return next(new ApiError(400, "Arrival datetime must be a valid date"));
  }

  // 6. Chronological Order Validation
  if (arrival <= departure) {
    return next(
      new ApiError(400, "Arrival datetime must be after departure datetime"),
    );
  }

  // 7. Available Seats Validation
  if (rawAvailableSeats === undefined || rawAvailableSeats === null || rawAvailableSeats === '') {
    return next(new ApiError(400, "Available seats is required"));
  }
  const availableSeats = Number(rawAvailableSeats);
  if (isNaN(availableSeats) || availableSeats < 0) {
    return next(
      new ApiError(400, "Available seats must be a valid number"),
    );
  }

  // 8. Schedule Status Whitelist Check (Including frontend statuses like 'On-Time')
  if (status !== undefined && status !== null && status !== '') {
    const allowedStatus = ["scheduled", "running", "completed", "cancelled", "on-time", "delayed"];
    const normalizedStatus = String(status).toLowerCase();

    if (!allowedStatus.includes(normalizedStatus)) {
      return next(
        new ApiError(
          400,
          "Status must be one of: scheduled, running, completed, cancelled, on-time, delayed",
        ),
      );
    }
  }

  // Normalize req.body so controller & model get standard snake_case and formatted DATETIME strings
  req.body.bus_id = busId;
  req.body.route_id = routeId;
  req.body.driver_id = driverId;
  req.body.departure_datetime = departure.toISOString().slice(0, 19).replace('T', ' ');
  req.body.arrival_datetime = arrival.toISOString().slice(0, 19).replace('T', ' ');
  req.body.available_seats = availableSeats;

  return next();
};

/**
 * Validates partial update payloads for existing bus schedules
 */
export const updateScheduleValidation = (req, res, next) => {
  const rawBusId = req.body.bus_id !== undefined ? req.body.bus_id : req.body.busId;
  const rawRouteId = req.body.route_id !== undefined ? req.body.route_id : req.body.routeId;
  const rawDriverId = req.body.driver_id !== undefined ? req.body.driver_id : req.body.driverId;
  const rawAvailableSeats = req.body.available_seats !== undefined ? req.body.available_seats : req.body.availableSeats;
  
  let rawDeparture = req.body.departure_datetime || req.body.departureDatetime;
  if (!rawDeparture && req.body.departureDate && req.body.departureTime) {
    rawDeparture = `${req.body.departureDate}T${req.body.departureTime}`;
  }

  let rawArrival = req.body.arrival_datetime || req.body.arrivalDatetime;
  if (!rawArrival && req.body.departureDate && req.body.arrivalTime) {
    rawArrival = `${req.body.departureDate}T${req.body.arrivalTime}`;
  }

  const status = req.body.status;

  // 1. Bus ID Check
  if (rawBusId !== undefined && rawBusId !== null && rawBusId !== '') {
    const busId = Number(rawBusId);
    if (isNaN(busId) || busId <= 0) {
      return next(new ApiError(400, "Bus ID must be a valid number"));
    }
    req.body.bus_id = busId;
  }

  // 2. Route ID Check
  if (rawRouteId !== undefined && rawRouteId !== null && rawRouteId !== '') {
    const routeId = Number(rawRouteId);
    if (isNaN(routeId) || routeId <= 0) {
      return next(new ApiError(400, "Route ID must be a valid number"));
    }
    req.body.route_id = routeId;
  }

  // 3. Driver ID Check
  if (rawDriverId !== undefined && rawDriverId !== null && rawDriverId !== '') {
    const driverId = Number(rawDriverId);
    if (isNaN(driverId) || driverId <= 0) {
      return next(new ApiError(400, "Driver ID must be a valid number"));
    }
    req.body.driver_id = driverId;
  }

  // 4. Departure Datetime Check
  let departure;
  if (rawDeparture !== undefined && rawDeparture !== null && rawDeparture !== '') {
    departure = new Date(rawDeparture);
    if (isNaN(departure.getTime())) {
      return next(new ApiError(400, "Departure datetime must be a valid date"));
    }
    req.body.departure_datetime = departure.toISOString().slice(0, 19).replace('T', ' ');
  }

  // 5. Arrival Datetime Check
  let arrival;
  if (rawArrival !== undefined && rawArrival !== null && rawArrival !== '') {
    arrival = new Date(rawArrival);
    if (isNaN(arrival.getTime())) {
      return next(new ApiError(400, "Arrival datetime must be a valid date"));
    }
    req.body.arrival_datetime = arrival.toISOString().slice(0, 19).replace('T', ' ');
  }

  // 6. Chronological Order Check
  if (departure !== undefined && arrival !== undefined && arrival <= departure) {
    return next(
      new ApiError(400, "Arrival datetime must be after departure datetime"),
    );
  }

  // 7. Available Seats Check
  if (rawAvailableSeats !== undefined && rawAvailableSeats !== null && rawAvailableSeats !== '') {
    const availableSeats = Number(rawAvailableSeats);
    if (isNaN(availableSeats) || availableSeats < 0) {
      return next(new ApiError(400, "Available seats must be a valid number"));
    }
    req.body.available_seats = availableSeats;
  }

  // 8. Schedule Status Whitelist Check
  if (status !== undefined && status !== null && status !== '') {
    const allowedStatus = ["scheduled", "running", "completed", "cancelled", "on-time", "delayed"];
    const normalizedStatus = String(status).toLowerCase();

    if (!allowedStatus.includes(normalizedStatus)) {
      return next(
        new ApiError(
          400,
          "Status must be one of: scheduled, running, completed, cancelled, on-time, delayed",
        ),
      );
    }
  }

  return next();
};