/**
 * @file reports.routes.js
 * @description Express Routes for Reports (ES6)
 */

import { Router } from "express";
import { getReportSummary } from "../../controllers/reports.controller.js";
import { reportsQueryValidation } from "../../validations/reports.validation.js";

const router = Router();

// GET /api/reports/summary - Fetch summary with optional query validation
router.get("/summary", reportsQueryValidation, getReportSummary);

export default router;