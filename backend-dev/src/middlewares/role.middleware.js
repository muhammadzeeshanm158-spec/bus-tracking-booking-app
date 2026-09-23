/**
 * @file role.middleware.js
 * @description Role-Based Access Control (RBAC) Express Middleware (ES6)
 * A higher-order middleware factory that verifies whether the authenticated user 
 * possesses an authorized role ID before granting access to protected endpoints.
 */

/**
 * @desc    Higher-order function creating a middleware to authorize specific user roles
 * @param   {Array<number|string>|number|string} requiredRole - Array or list of allowed role IDs permitted to access the route
 * @returns {import('express').RequestHandler} Express middleware function
 */
export const roleMiddleware = (...requiredRole) => {
  return (req, res, next) => {
    // Check if req.user exists (ensures user has gone through authMiddleware first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied",
      });
    }

    // Flattening arguments to handle both array format like [ROLES.ADMIN] and direct arguments like ROLES.ADMIN
    const allowedRoles = requiredRole.flat();

    // Check if the user's role_id (or roleId) exists in the list of required/allowed roles
    const userRoleId = req.user.role_id ?? req.user.roleId;

    if (!allowedRoles.includes(userRoleId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission to perform this action.",
      });
    }

    // User is authorized — pass execution to the next middleware or route controller
    return next();
  };
};