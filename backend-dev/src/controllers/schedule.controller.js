/**
 * @file schedule.controller.js
 * @description Express Controller Handlers for Bus Schedules with WebSockets (Pure MVC + ES6)
 */

import ScheduleModel from '../models/schedule.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import HTTP_STATUS from '../utils/httpStatus.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createScheduleController = asyncHandler(async (req, res) => {
  const { departureDate, departureTime, arrivalTime, ...rest } = req.body;

  const departure_datetime = `${departureDate} ${departureTime}:00`;
  const arrival_datetime = `${departureDate} ${arrivalTime}:00`;

  const scheduleData = {
    ...rest,
    departure_datetime,
    arrival_datetime
  };

  const newSchedule = await ScheduleModel.create(scheduleData);

  // --- WEBSOCKET TRIGGER ---
  // Naya schedule banne par drivers aur customers ko live broadcast bhejna
  const io = req.app.get("io");
  if (io) {
    io.to('customers-room').to('drivers-room').emit('schedule_updated', {
      action: 'CREATED',
      schedule: newSchedule,
      message: 'A new bus schedule has been added.'
    });
  }

  return successResponse(res, "Schedule created successfully", newSchedule, HTTP_STATUS.CREATED);
});

export const getAllSchedulesController = asyncHandler(async (req, res) => {
  const schedules = await ScheduleModel.getAll();
  return successResponse(res, "Schedules fetched successfully", schedules, HTTP_STATUS.OK);
});

export const getScheduleByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const schedule = await ScheduleModel.getById(id);

  if (!schedule) {
    return errorResponse(res, 'Schedule not found', HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(res, "Schedule fetched successfully", schedule, HTTP_STATUS.OK);
});

export const updateScheduleController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { departureDate, departureTime, arrivalTime, ...rest } = req.body;

  let scheduleData = { ...rest };

  if (departureDate && departureTime) {
    scheduleData.departure_datetime = `${departureDate} ${departureTime}:00`;
  }
  if (departureDate && arrivalTime) {
    scheduleData.arrival_datetime = `${departureDate} ${arrivalTime}:00`;
  }

  const updatedSchedule = await ScheduleModel.update(id, scheduleData);

  if (!updatedSchedule) {
    return errorResponse(res, 'Schedule not found or update failed', HTTP_STATUS.NOT_FOUND);
  }

  // --- WEBSOCKET TRIGGER ---
  const io = req.app.get("io");
  if (io) {
    io.to('customers-room').to('drivers-room').emit('schedule_updated', {
      action: 'UPDATED',
      scheduleId: id,
      message: 'A bus schedule has been updated.'
    });
  }

  return successResponse(res, "Schedule updated successfully", updatedSchedule, HTTP_STATUS.OK);
});

export const deleteScheduleController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await ScheduleModel.delete(id);

  if (!deleted) {
    return errorResponse(res, 'Schedule not found', HTTP_STATUS.NOT_FOUND);
  }

  // --- WEBSOCKET TRIGGER ---
  const io = req.app.get("io");
  if (io) {
    io.to('customers-room').to('drivers-room').emit('schedule_updated', {
      action: 'DELETED',
      scheduleId: id,
      message: 'A bus schedule has been cancelled/deleted.'
    });
  }

  return successResponse(res, "Schedule deleted successfully", null, HTTP_STATUS.OK);
});