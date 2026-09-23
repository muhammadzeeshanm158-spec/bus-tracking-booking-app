/**
 * @file login.component.ts
 * @description User Login Component jo Reactive Forms, validation, aur AuthService ke zariye backend authentication handle karta hai.
 */

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/authService/auth.service';

interface LoginResponse {
  data?: {
    user?: {
      role?: string;
    };
  };
  user?: {
    role?: string;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  // Modern Angular inject function ke zariye FormBuilder, AuthService, Router, aur ActivatedRoute instances la rahe hain
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // URL query parameters (returnUrl) read karne ke liye

  // Login Form Group: Email aur Password fields ke sath validation rules define kiye hain
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // UI state variables
  showPassword = false; // Password text show/hide toggle karne ke liye
  isLoading = false;    // API request ke doran loading spinner ya disabled state ke liye
  errorMessage = '';    // Login fail hone par error message show karne ke liye
  
  private returnUrl = '/dashboard'; // Default fallback path

  ngOnInit(): void {
    // URL se returnUrl get kar rahe hain (agar maujood ho, warna default /dashboard)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Page load hote hi login form ko clean kar do
    this.loginForm.reset();
  }

  /**
   * @method togglePassword
   * @description Password field ki visibility (show/hide text) ko toggle karta hai
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * @method onLogin
   * @description Form submit hone par credentials validate karke AuthService ke login method ko call karta hai aur role ke mutabiq redirect karta hai
   */
  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading = false;
        this.loginForm.reset();

        const userRole = response?.data?.user?.role || '';

        // Role ke mutabiq dynamic redirection (Driver ke liye /schedules set kar diya hai)
        if (userRole.toLowerCase() === 'admin') {
          this.router.navigate(['/admin-panel']);
        } else if (userRole.toLowerCase() === 'driver') {
          this.router.navigate(['/schedules']);
        } else {
          const targetUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(targetUrl);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login Failed:', err);
        this.errorMessage = err.error?.message || 'Invalid email or password. Please try again.';
      }
    });
  }

  /**
   * @method goToRegister
   * @description User ko login page se register page par redirect karta hai
   */
  goToRegister(): void {
    this.loginForm.reset();
    this.router.navigate(['/auth/register']);
  }
}