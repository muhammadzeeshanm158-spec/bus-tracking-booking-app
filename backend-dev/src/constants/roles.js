/**
 * @file roles.js
 * @description System User Role Definitions / RBAC Constants (ES6)
 */

/**
 * System Role IDs (Yeh database ya role management ke liye numerical IDs hain)
 */
export const ROLES = {
  ADMIN: 1,    // System Administrator ke liye ID 1
  CUSTOMER: 2, // Aam Customer/Passenger ke liye ID 2
  DRIVER: 3,   // Bus Driver ke liye ID 3
};

/**
 * Human-readable Role Names (Yeh UI display ya response payloads mein readable naam dikhane ke liye hain)
 */
export const ROLE_NAMES = {
  [ROLES.ADMIN]: "Admin",    // ID 1 ko "Admin" ke tor par map kiya gaya hai
  [ROLES.CUSTOMER]: "Customer", // ID 2 ko "Customer" ke tor par map kiya gaya hai
  [ROLES.DRIVER]: "Driver",   // ID 3 ko "Driver" ke tor par map kiya gaya hai
};