/**
 * @file customer.routes.js
 * @description Customer Endpoints Configuration for Express Router (ES6)
 */

import { Router } from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from "../../controllers/customer.controller.js";
import {
  createCustomerValidation,
  updateCustomerValidation
} from "../../validations/customer.validation.js";

const router = Router();

// =========================================================================
// CUSTOMER ROUTES SETUP
// =========================================================================

// 1. TAMAM CUSTOMERS GET KARNA AUR NAYA CUSTOMER CREATE KARNA
// GET  /api/v1/customers - Database se tamam customers ki list fetch karne ke liye
// POST /api/v1/customers - Payload validate karne ke baad naya customer insert karne ke liye
router.route("/")
  .get(getCustomers)
  .post(createCustomerValidation, createCustomer);

// 2. SINGLE CUSTOMER GET, UPDATE AUR DELETE KARNA
// GET    /api/v1/customers/:id - Kisi specific customer ki details fetch karne ke liye
// PUT    /api/v1/customers/:id - Customer data validate karke details update karne ke liye
// DELETE /api/v1/customers/:id - Customer ko database se remove karne ke liye
router.route("/:id")
  .get(getCustomerById)
  .put(updateCustomerValidation, updateCustomer)
  .delete(deleteCustomer);

export default router;