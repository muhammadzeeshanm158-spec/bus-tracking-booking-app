/**
 * @file register.component.ts
 * @description User Registration Component jo naye user account creation ke liye Reactive Forms, validations, aur AuthService handle karta hai.
 */

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/authService/auth.service';
import { AuthResponse, RegisterRequest } from '../models/auth.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  // Modern Angular inject function ke zariye FormBuilder, AuthService, aur Router instances la rahe hain
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Register Form Group: Name, Email, Phone, Gender, Password, aur Confirm Password fields ke sath validation rules
  registerForm: FormGroup = this.fb.group({
    full_name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone_number: ['', [Validators.required]],
    gender: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  // UI state variables
  showPassword = false;         // Password field text show/hide toggle karne ke liye
  showConfirmPassword = false;  // Confirm Password field text show/hide toggle karne ke liye
  isLoading = false;            // API request ke doran loading state manage karne ke liye
  errorMessage = '';            // Validation ya API error message display karne ke liye

  /**
   * @method togglePassword
   * @description Main password field ki visibility ko toggle karta hai
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * @method toggleConfirmPassword
   * @description Confirm password field ki visibility ko toggle karta hai
   */
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * @method onRegister
   * @description Form submit hone par validation checks perform karta hai aur AuthService ke register method ko call karta hai
   */
  onRegister(): void {
    // 1. Check karein ke form invalid toh nahi hai
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); // Saare controls ko touched mark kar do taake errors highlight ho jayein
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    // 2. Password aur Confirm Password match check kar rahe hain
    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Form value ko RegisterRequest model type mein cast kar rahe hain
    const formData = this.registerForm.value as RegisterRequest;

    // AuthService ka register method call karke Observable subscribe kar rahe hain
    this.authService.register(formData).subscribe({
      next: (response: AuthResponse) => {
        this.isLoading = false;
        console.log('Registration Successful:', response);
        
        // 1. Successful registration ke baad form ko reset/empty kar rahe hain
        this.registerForm.reset();

        // 2. Successful registration ke baad user ko login page par redirect kar rahe hain
        this.router.navigate(['/auth/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Registration Failed:', err);
        
        // Backend se aane wala error message ya default error set kar rahe hain
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  /**
   * @method goToLogin
   * @description Jab user register page se login page par manually click kare
   */
  goToLogin(): void {
    this.registerForm.reset();
    this.router.navigate(['/auth/login']);
  }
}