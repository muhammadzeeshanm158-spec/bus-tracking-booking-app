/**
 * @file driver.controller.js
 * @description Driver Management Controller for handling incoming HTTP requests related to drivers.
 */

import DriverModel from '../models/driver.model.js';

class DriverController {
  /**
   * Fetch all registered drivers joined with user details.
   * 
   * @async
   * @function getDrivers
   * @param {import('express').Request} req - Express Request object
   * @param {import('express').Response} res - Express Response object
   * @param {import('express').NextFunction} next - Express Next middleware function
   * @returns {Promise<void>} JSON response containing the list of drivers
   */
  static async getDrivers(req, res, next) {
    try {
      const drivers = await DriverModel.getAllDrivers();

      const formattedDrivers = drivers.map(driver => {
        let statusText = 'Available';
        let isAvailVal = driver.is_available !== undefined ? driver.is_available : driver.isAvailable;

        // Database value ke hisab se status text map karna
        if (isAvailVal === 0 || isAvailVal === '0' || String(isAvailVal).toLowerCase() === 'inactive') {
          statusText = 'Inactive';
        } else if (isAvailVal === 2 || isAvailVal === '2' || String(isAvailVal).toLowerCase() === 'on duty' || String(isAvailVal).toLowerCase() === 'on-duty') {
          statusText = 'On Duty';
        } else if (isAvailVal === 3 || isAvailVal === '3' || String(isAvailVal).toLowerCase() === 'on leave' || String(isAvailVal).toLowerCase() === 'on-leave') {
          statusText = 'On Leave';
        } else {
          statusText = 'Available';
        }

        return {
          ...driver,
          status: driver.status || statusText
        };
      });

      return res.status(200).json({
        success: true,
        count: formattedDrivers.length,
        data: formattedDrivers
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch a single driver profile by ID along with user details.
   * 
   * @async
   * @function getDriverById
   * @param {import('express').Request} req - Express Request object
   * @param {import('express').Response} res - Express Response object
   * @param {import('express').NextFunction} next - Express Next middleware function
   * @returns {Promise<void>} JSON response with the driver details
   */
  static async getDriverById(req, res, next) {
    try {
      const { id } = req.params;
      const driver = await DriverModel.getDriverById(id);

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: `Driver with ID ${id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        data: driver
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new driver profile.
   * 
   * @async
   * @function createDriver
   * @param {import('express').Request} req - Express Request object
   * @param {import('express').Response} res - Express Response object
   * @param {import('express').NextFunction} next - Express Next middleware function
   * @returns {Promise<void>} JSON response with the created driver details
   */
  static async createDriver(req, res, next) {
    try {
      const body = req.body || {};

      const rawAvailability = body.status !== undefined && body.status !== null && body.status !== '' 
        ? body.status 
        : (body.is_available !== undefined ? body.is_available : body.isAvailable);
      
      let isAvailableVal = 1; // Default Available (1)

      if (rawAvailability !== undefined && rawAvailability !== null) {
        const valStr = String(rawAvailability).trim().toLowerCase();
        
        // 1. Inactive / Off-Duty / 0
        if (valStr === '0' || valStr === 'false' || valStr === 'inactive' || valStr === 'off-duty' || valStr === 'off duty' || valStr === 'offline') {
          isAvailableVal = 0;
        } 
        // 2. On Duty / 2
        else if (valStr === '2' || valStr === 'on duty' || valStr === 'on-duty' || valStr === 'onduty') {
          isAvailableVal = 2;
        } 
        // 3. On Leave / 3
        else if (valStr === '3' || valStr === 'on leave' || valStr === 'on-leave' || valStr === 'onleave') {
          isAvailableVal = 3;
        } 
        // 4. Available / 1 / Active
        else {
          isAvailableVal = 1;
        }
      }

      const mappedDriverData = {
        ...body,
        user_id: body.user_id !== undefined ? body.user_id : (body.userId !== undefined ? body.userId : 1),
        userId: body.userId !== undefined ? body.userId : (body.user_id !== undefined ? body.user_id : 1),
        license_number: body.license_number !== undefined ? body.license_number : body.licenseNumber,
        licenseNumber: body.licenseNumber !== undefined ? body.licenseNumber : body.license_number,
        experience_years: body.experience_years !== undefined ? body.experience_years : body.experienceYears,
        experienceYears: body.experienceYears !== undefined ? body.experienceYears : body.experience_years,
        joining_date: body.joining_date !== undefined ? body.joining_date : body.joiningDate,
        joiningDate: body.joiningDate !== undefined ? body.joiningDate : body.joining_date,
        is_available: isAvailableVal,
        isAvailable: isAvailableVal,
        phone_number: body.phone_number !== undefined ? body.phone_number : body.phone,
        phone: body.phone !== undefined ? body.phone : body.phone_number,
        license_category: body.license_category !== undefined ? body.license_category : body.licenseCategory,
        licenseCategory: body.licenseCategory !== undefined ? body.licenseCategory : body.license_category
      };

      const newDriverId = await DriverModel.create(mappedDriverData);
      const newDriver = await DriverModel.getDriverById(newDriverId);
      
      return res.status(201).json({
        success: true,
        message: "Driver created successfully",
        data: newDriver
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing driver profile.
   * 
   * @async
   * @function updateDriver
   * @param {import('express').Request} req - Express Request object
   * @param {import('express').Response} res - Express Response object
   * @param {import('express').NextFunction} next - Express Next middleware function
   * @returns {Promise<void>} JSON response with updated details
   */
  static async updateDriver(req, res, next) {
    try {
      const { id } = req.params;
      const body = req.body || {};

      console.log("--- UPDATE DRIVER DEBUG ---");
      console.log("Full Request Body:", body);

      const rawAvailability = body.status !== undefined && body.status !== null && body.status !== '' 
        ? body.status 
        : (body.is_available !== undefined ? body.is_available : body.isAvailable);
      
      let isAvailableVal = 1; // Default Available

      if (rawAvailability !== undefined && rawAvailability !== null) {
        const valStr = String(rawAvailability).trim().toLowerCase();
        
        // 1. Inactive
        if (valStr === '0' || valStr === 'false' || valStr === 'inactive' || valStr === 'off-duty' || valStr === 'off duty' || valStr === 'offline') {
          isAvailableVal = 0;
        } 
        // 2. On Duty
        else if (valStr === '2' || valStr === 'on duty' || valStr === 'on-duty' || valStr === 'onduty') {
          isAvailableVal = 2;
        } 
        // 3. On Leave
        else if (valStr === '3' || valStr === 'on leave' || valStr === 'on-leave' || valStr === 'onleave') {
          isAvailableVal = 3;
        } 
        // 4. Available
        else {
          isAvailableVal = 1;
        }
      }

      const mappedUpdateData = {
        ...body,
        user_id: body.user_id !== undefined ? body.user_id : body.userId,
        userId: body.userId !== undefined ? body.userId : body.user_id,
        license_number: body.license_number !== undefined ? body.license_number : body.licenseNumber,
        licenseNumber: body.licenseNumber !== undefined ? body.licenseNumber : body.license_number,
        experience_years: body.experience_years !== undefined ? body.experience_years : body.experienceYears,
        experienceYears: body.experienceYears !== undefined ? body.experienceYears : body.experience_years,
        joining_date: body.joining_date !== undefined ? body.joining_date : body.joiningDate,
        joiningDate: body.joiningDate !== undefined ? body.joiningDate : body.joining_date,
        is_available: isAvailableVal,
        isAvailable: isAvailableVal,
        license_category: body.license_category !== undefined ? body.license_category : body.licenseCategory,
        licenseCategory: body.licenseCategory !== undefined ? body.licenseCategory : body.license_category
      };
      
      const affectedRows = await DriverModel.update(id, mappedUpdateData);

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: `Driver with ID ${id} not found`
        });
      }

      const updatedDriver = await DriverModel.getDriverById(id);
      
      return res.status(200).json({
        success: true,
        message: `Driver with ID ${id} updated successfully`,
        data: updatedDriver
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an existing driver profile and user record.
   */
  static async deleteDriver(req, res, next) {
    try {
      const { id } = req.params;
      const affectedRows = await DriverModel.delete(id);

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: `Driver with ID ${id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Driver with ID ${id} deleted successfully`
      });
    } catch (error) {
      next(error);
    }
  }
 
}

export default DriverController;