/**
 * @file payment.controller.js
 * @description Express Controller Handlers for Payment Transaction Management (MySQL + ES6)
 */

import Payment from '../models/payment.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import HTTP_STATUS from '../utils/httpStatus.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * @desc    Process/Create a new payment transaction record
 * @route   POST /api/payments
 */
export const createPaymentController = asyncHandler(async (req, res) => {
  const newPayment = await Payment.create(req.body);
  return successResponse(res, "Payment created successfully", newPayment, HTTP_STATUS.CREATED);
});

/**
 * @desc    Retrieve all payment transactions with search, pagination, and status filters
 * @route   GET /api/payments
 */
export const getAllPaymentsController = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const filters = {
    payment_status: req.query.payment_status,
    payment_method: req.query.payment_method,
    search: req.query.search
  };

  const sortBy = req.query.sortBy || 'created_at';
  const order = req.query.order === 'ASC' ? 'ASC' : 'DESC';

  const totalPayments = await Payment.countDocuments(filters);
  const payments = await Payment.findAll(filters, { limit, offset, sortBy, order });

  const result = {
    payments,
    currentPage: page,
    totalPages: Math.ceil(totalPayments / limit) || 1,
    totalPayments,
  };

  return successResponse(res, "Payments retrieved successfully", result, HTTP_STATUS.OK);
});

/**
 * @desc    Fetch a specific payment transaction record by unique ID
 * @route   GET /api/payments/:id
 */
export const getPaymentByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payment = await Payment.findById(id);

  if (!payment) {
    return errorResponse(res, 'Payment not found', HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(res, "Payment details retrieved successfully", payment, HTTP_STATUS.OK);
});

/**
 * @desc    Update details for an existing payment transaction
 * @route   PUT /api/payments/:id
 */
export const updatePaymentController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedPayment = await Payment.update(id, req.body);

  if (!updatedPayment) {
    return errorResponse(res, 'Payment not found or no changes made', HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(res, "Payment updated successfully", updatedPayment, HTTP_STATUS.OK);
});

/**
 * @desc    Delete a payment transaction record by ID
 * @route   DELETE /api/payments/:id
 */
export const deletePaymentController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedPayment = await Payment.delete(id);

  if (!deletedPayment) {
    return errorResponse(res, 'Payment not found', HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(res, "Payment deleted successfully", null, HTTP_STATUS.OK);
});

