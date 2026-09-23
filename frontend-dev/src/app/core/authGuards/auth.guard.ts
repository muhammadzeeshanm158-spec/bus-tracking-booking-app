/**
 * @file auth.guard.ts
 * @description Route Guard jo check karta hai ke user authenticated (logged in) hai ya nahi. 
 * Agar logged in hai toh route access mil jata hai, warna login page par redirect kar diya jata hai.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../authService/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  // Modern inject function ke zariye AuthService aur Router instances la rahe hain
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Check kar rahe hain ke AuthService ka isAuthenticated signal true hai ya nahi
  if (authService.isAuthenticated()) {
    return true; // Agar logged in hai toh route access allow kar do
  }

  // 2. Agar user logged in nahi hai, toh login page par redirect kar do 
  // aur sath hi current URL ko queryParams mein save kar lo taaki login ke baad wahan wapas aa sakein
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false; // Route access deny kar do
};