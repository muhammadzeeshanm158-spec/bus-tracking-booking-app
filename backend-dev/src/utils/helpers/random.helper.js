/**
 * @file generateRandomNumber.js
 * @description Random Code / Number Generator Utility (ES6)
 */

/**
 * Generates a guaranteed 6-digit random number string (e.g. "048291" or "894210")
 * @param {number} [digits=6] - Number of digits required
 * @returns {string} Fixed-length numeric string
 */
export const generateRandomNumber = (digits = 6) => {
  // Diye gaye digits ke lihaz se minimum value calculate kar rahe hain (jese 6 digits ke liye 100000)
  const min = Math.pow(10, digits - 1);
  
  // Maximum value calculate kar rahe hain (jese 6 digits ke liye 999999)
  const max = Math.pow(10, digits) - 1;
  
  // Min aur Max ke darmiyan ek random integer generate kar rahe hain (inclusive)
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Number ko string mein convert karke return kar rahe hain taaki leading zeros maintain reh sakein
  return randomNumber.toString();
};