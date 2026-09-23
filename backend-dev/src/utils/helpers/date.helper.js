/**
 * @file formatDate.js
 * @description Date Formatting Utility Functions (ES6)
 */

/**
 * Formats a given date into 'DD/MM/YYYY' (en-GB locale)
 * @param {string|number|Date} date - Input date value
 * @returns {string|null} Formatted date string or null if invalid
 */
export const formatDate = (date) => {
  // Agar date ki value mojood nahi hai toh null return kar do
  if (!date) return null;

  // Input value ko Date object mein convert kar rahe hain
  const parsedDate = new Date(date);
  
  // Check kar rahe hain ke date valid hai ya nahi (agar invalid ho toh isNaN true hoga)
  if (isNaN(parsedDate.getTime())) {
    return null;
  }

  // Valid date ko 'en-GB' locale (DD/MM/YYYY format) ke mutabiq format karke return kar rahe hain
  return parsedDate.toLocaleDateString("en-GB");
};