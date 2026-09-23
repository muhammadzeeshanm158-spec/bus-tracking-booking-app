// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../authService/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Current user ka data fetch karein
  const currentUser = authService.currentUser();
  
  // 2. Route ki configuration se allowed roles nikalain
  const allowedRoles = route.data?.['roles'] as string[];

  // Agar user logged in nahi hai, toh foran login par bhejein
  if (!currentUser) {
    router.navigate(['/auth/login'], { replaceUrl: true });
    return false;
  }

  // 3. Role ko lowercase mein convert karein taake 'Admin' aur 'admin' ka farq khatam ho jaye
  const userRole = currentUser.role ? currentUser.role.toLowerCase() : '';
  const formattedAllowedRoles = allowedRoles ? allowedRoles.map(r => r.toLowerCase()) : [];

  // 4. Check karein ke role allowed roles mein shamil hai ya nahi
  if (userRole && formattedAllowedRoles.includes(userRole)) {
    return true; // Access granted, dashboard khul jayega!
  }

  // 5. Agar role match nahi hota, toh login par redirect kar dein
  router.navigate(['/auth/login'], { replaceUrl: true });
  return false;
};