/**
 * @file auth.interceptor.ts
 * @description Functional HTTP Interceptor jo har outgoing API request ko intercept karta hai,
 * aur agar user logged in ho (JWT token maujood ho), toh request header mein 'Authorization' token attach kar deta hai.
 */

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Local storage se authentication token nikal rahe hain
  const token = localStorage.getItem('token');

  // 2. Agar token mil jaye, toh request ko clone karke Authorization header add karein
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned); // Modified/Secured request ko aage forward kar dein
  }

  // 3. Agar token nahi hai (misal ke taur par Login/Register request), toh request ko bina change kiye waise hi aage bhej dein
  return next(req);
};