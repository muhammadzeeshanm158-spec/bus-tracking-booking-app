/**
 * @file pagination.js
 * @description Database Pagination Helper Utility (ES6)
 */

/**
 * Calculates sanitized pagination parameters and SQL offset
 * @param {number|string} [page=1] - Target page number
 * @param {number|string} [limit=10] - Number of records per page
 * @returns {{page: number, limit: number, offset: number}}
 */
export const getPagination = (page = 1, limit = 10) => {
  // Inputs ko integers mein parse kar rahe hain aur ensure karte hain ke page kam az kam 1 ho
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  
  // Per page records ki limit set kar rahe hain (maximum cap 100 rakhi hai taaki database par extra load na paray)
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

  // MySQL query ke liye SQL OFFSET calculate kar rahe hain
  const offset = (parsedPage - 1) * parsedLimit;

  // Sanitized pagination values return kar rahe hain
  return {
    page: parsedPage,
    limit: parsedLimit,
    offset,
  };
};