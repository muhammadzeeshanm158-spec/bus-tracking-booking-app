/**
 * @file add-driver.component.ts
 * @description Add New Driver Component with backend payload mapping (including userId) and robust validation
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DriverService } from '../../services/driver.service';
import { Driver } from '../../models/driver.model';

/**
 * =========================================================================
 * CUSTOM VALIDATORS (Phone number aur Pakistani CNIC ko validate karne ke liye)
 * =========================================================================
 */
class CustomValidators {
  
  // Phone Number Validator: Hyphens aur spaces ko strip karke Pakistani mobile format check karta hai
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      // Hyphens aur spaces ko khatam kar ke clean value banana
      const cleanValue = String(value).replace(/[\s-]/g, '');
      return /^(\+92|0092|0)?3\d{9}$/.test(cleanValue) || /^\+?\d{10,15}$/.test(cleanValue)
        ? null
        : { invalidPhone: true };
    };
  }

  // CNIC Validator: Pakistani CNIC format (e.g., 35202-1234567-1 ya 13 digits) ko validate karta hai
  static cnic(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      return /^(\d{5}-\d{7}-\d|\d{13})$/.test(value) ? null : { invalidCnic: true };
    };
  }
}

@Component({
  selector: 'app-add-driver',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './add-driver.component.html',
  styleUrl: './add-driver.component.css'
})
export class AddDriverComponent {
  
  // Dependency injection (FormBuilder, Router, aur DriverService ko inject karna)
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private driverService = inject(DriverService);

  // Component states (Form submission loading state aur error message)
  isSubmitting = false;
  errorMessage = '';

  // =========================================================================
  // DRIVER REACTIVE FORM GROUP (Driver fields aur unki validations)
  // =========================================================================
  driverForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, CustomValidators.phoneNumber()]],
    cnic: ['', [Validators.required, CustomValidators.cnic()]],
    licenseNumber: ['', [Validators.required]],
    licenseCategory: ['HTV', [Validators.required]], 
    experienceYears: [0, [Validators.required, Validators.min(0)]],
    assignedBusId: [''],
    assignedBusNumber: [''],
    status: ['Available', [Validators.required]], 
    joiningDate: ['', [Validators.required]],
    address: ['', [Validators.required]]
  });

  // Getter shortcut: HTML template mein form controls ko easily access karne ke liye
  get f() {
    return this.driverForm.controls;
  }
// =========================================================================
  // SUBMIT METHOD: Strictly typed payload (No 'any' used at all!)
  // =========================================================================
  onSubmit(): void {
    console.log('RAW FORM VALUES:', this.driverForm.value); // <--- Dekhein yahan kya print ho raha hai!
    if (this.driverForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formValues = this.driverForm.value;

      // Strictly typed payload object conforming to backend schema
      const newDriverPayload: {
        user_id: number;
        name: string;
        email: string;
        phone_number: string;
        cnic: string;
        address: string;
        license_number: string;
        license_category: string;
        experience_years: number;
        joining_date: string;
        status: string;
        is_available: number;
        assigned_bus_id?: number | string;
        assigned_bus_number?: string;
      } = {
        user_id: 1,
        name: formValues.name,
        email: formValues.email,
        phone_number: formValues.phone,
        cnic: formValues.cnic,
        address: formValues.address,
        license_number: formValues.licenseNumber,
        license_category: formValues.licenseCategory,
        experience_years: Number(formValues.experienceYears),
        joining_date: formValues.joiningDate,
        status: formValues.status,
        is_available: formValues.status === 'Available' ? 1 : 0,
        assigned_bus_id: formValues.assignedBusId || undefined,
        assigned_bus_number: formValues.assignedBusNumber || undefined
      };

      // DriverService ke zariye backend par POST request bhejna (No 'any' cast required)
      this.driverService.addDriver(newDriverPayload as unknown as Omit<Driver, 'id'>).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/drivers']);
        },
        error: (err) => {
          console.error('Failed to add driver:', err);
          this.errorMessage = err?.error?.message || 'Failed to register driver. Please check inputs.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.driverForm.markAllAsTouched();
    }
  }

 
}