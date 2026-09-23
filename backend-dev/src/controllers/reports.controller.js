/**
 * @file reports.controller.js
 * @description Controller for Reports & Analytics (ES6)
 */

import { ReportsModel } from "../models/reports.model.js";
import ApiError from "../utils/ApiError.js";

/**
 * Fetch overall summary reports
 */
export const getReportSummary = async (req, res, next) => {
  try {
    const totalRevenue = await ReportsModel.getTotalRevenue();
    const totalBookings = await ReportsModel.getTotalBookings();
    const totalBuses = await ReportsModel.getTotalBuses();
    const totalCustomers = await ReportsModel.getTotalCustomers();

    const summaryData = {
      totalRevenue,
      totalBookings,
      totalBuses,
      totalCustomers,
    };

    res.status(200).json({
      success: true,
      message: "Reports summary fetched successfully",
      data: summaryData,
    });
  } catch (error) {
    console.error("Error in getReportSummary controller:", error);
    return next(new ApiError(500, "Internal server error while fetching reports"));
  }
};