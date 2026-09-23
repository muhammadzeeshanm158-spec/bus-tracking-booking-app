/**
 * @file auth.model.ts
 * @description Authentication aur User management se related TypeScript interfaces/types ka collection.
 */

/**
 * @interface User
 * @description System ke registered user ki details define karta hai
 */
export interface User {
  id?: string | number;     // User ki unique ID (MySQL ID number)
  full_name?: string;       // User ka poora naam (Updated from 'name' to 'full_name')
  email?: string;           // User ka email address
  phone_number?: string;    // User ka phone number
  gender?: string;          // User ka gender
  role?: string;            // User role (admin / user)
}

/**
 * @interface AuthResponse
 * @description Jab user successfully login ya register ho jata hai, tab server yeh response return karta hai
 */
export interface AuthResponse {
  token: string;            // JWT Authentication token
  user: User;               // Logged-in user ki details
}

/**
 * @interface LoginRequest
 * @description Login API request ke liye required payload structure
 */
export interface LoginRequest {
  email: string;            // User ka email
  password: string;         // User ka password
}

/**
 * @interface RegisterRequest
 * @description Naya account register karte waqt server ko bheja jane wala payload structure
 */
export interface RegisterRequest {
  full_name: string;        // User ka poora naam
  email: string;            // User ka email address
  password: string;         // Account ka password
  phone_number?: string;    // Optional phone number
  gender?: string;          // Optional/Required gender based on form
}