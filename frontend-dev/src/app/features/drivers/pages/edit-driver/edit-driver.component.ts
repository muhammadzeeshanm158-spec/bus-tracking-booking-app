/**
 * @file edit-driver.component.ts
 * @description Edit Driver Component with full type safety (No 'any' usage) and Roman Urdu comments
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DriverService } from '../../services/driver.service';
import { Driver } from '../../models/driver.model';

/**
 * =========================================================================
 * CUSTOM VALIDATORS CLASS
 * Phone number aur CNIC formats validate karne ke liye custom rules
 * =========================================================================
 */
class CustomValidators {
  
  // 1. Phone Number Validator: Pakistani mobile formats (+92 / 03xx) ko check karta hai
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      return /^((\+92)|(0092)|(0))?3\d{9}$/.test(value) || /^\+?\d{10,15}$/.test(value)
        ? null
        : { invalidPhone: true };
    };
  }

  // 2. CNIC Validator: Pakistani CNIC format (e.g., 35202-1234567-1 ya 13 digits) ko validate karta hai
  static cnic(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      return /^(\d{5}-\d{7}-\d|\d{13})$/.test(value) ? null : { invalidCnic: true };
    };
  }
}

@Component({
  selector: 'app-edit-driver',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './edit-driver.component.html',
  styleUrl: './edit-driver.component.css'
})
export class EditDriverComponent implements OnInit {
  
  // Dependency Injection (Services aur Routing tools inject karna)
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private driverService = inject(DriverService);

  // Component State Variables (Driver ID, loading, aur error states)
  driverId = '';
  isSubmitting = false;
  isLoading = true;
  errorMessage = '';

  // Reactive Driver Form Initialization (Validation rules ke sath)
 // Reactive Driver Form Initialization (Optional fields ki validation hata di hai)
  driverForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, CustomValidators.phoneNumber()]],
    cnic: [''], // Optional kar diya
    licenseNumber: ['', [Validators.required]],
    licenseCategory: ['HTV', [Validators.required]],
    experienceYears: [0], // Optional kar diya
    assignedBusId: [''],
    assignedBusNumber: [''],
    status: ['Available', [Validators.required]],
    joiningDate: [''], // Optional kar diya
    address: [''] // Optional kar diya
  });

  // Getter shortcut: HTML template mein form controls ko easily access karne ke liye
  get f() {
    return this.driverForm.controls;
  }

  // =========================================================================
  // LIFECYCLE HOOK: ngOnInit
  // URL se driver ID nikal kar purana data load karne ke liye
  // =========================================================================
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.driverId = idParam;
      this.loadDriverData(this.driverId);
    } else {
      this.errorMessage = 'Invalid driver ID.';
      this.isLoading = false;
    }
  }

  /**
   * 1. LOAD DRIVER DATA: Server se driver details fetch karke form patch karna (Strict Typing)
   */
  loadDriverData(id: string): void {
     this.isLoading = true;
     this.driverService.getDriverById(id).subscribe({
       next: (response: Driver) => {
         // Raw data ko safely handle karne ke liye unknown casting use ki hai taake type error na aaye
         const rawDriver = response as unknown as Record<string, string | number | undefined>;
         
         this.driverForm.patchValue({
           name: rawDriver['name'],
           email: rawDriver['email'],
           phone: rawDriver['phone'] || rawDriver['phone_number'],
           cnic: rawDriver['cnic'],
           licenseNumber: rawDriver['licenseNumber'] || rawDriver['license_number'],
           licenseCategory: rawDriver['licenseCategory'] || rawDriver['license_category'],
           experienceYears: rawDriver['experienceYears'] !== undefined ? rawDriver['experienceYears'] : rawDriver['experience_years'],
           assignedBusId: rawDriver['assignedBusId'] || rawDriver['assigned_bus_id'],
           assignedBusNumber: rawDriver['assignedBusNumber'] || rawDriver['assigned_bus_number'],
           status: rawDriver['status'] || (rawDriver['is_available'] === 1 ? 'Available' : 'Inactive'),
           joiningDate: rawDriver['joiningDate'] || rawDriver['joining_date'],
           address: rawDriver['address']
         });
         this.isLoading = false;
       },
       error: (err) => {
         console.error('Failed to load driver details:', err);
         this.errorMessage = 'Failed to load driver data from server.';
         this.isLoading = false;
       }
     });
   }

  /**
   * 2. ON SUBMIT: Form valid hone par updated data ko strictly typed payload ke sath backend par bhejna
   */
  onSubmit(): void {
    if (this.driverForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formValues = this.driverForm.value;

      // Backend payload structure mapping (Database schema / snake_case ke mutabiq)
      const updatedDriverPayload: Omit<Driver, 'id'> = {
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        cnic: formValues.cnic,
        address: formValues.address,
        licenseNumber: formValues.licenseNumber,
        licenseCategory: formValues.licenseCategory,
        experienceYears: Number(formValues.experienceYears),
        joiningDate: formValues.joiningDate,
        status: formValues.status,
        isAvailable: formValues.status === 'Available' ? 1 : 0,
        assignedBusId: formValues.assignedBusId || undefined,
        assignedBusNumber: formValues.assignedBusNumber || undefined
      };

      // DriverService ke zariye update request bhejna (No 'any' type used)
      this.driverService.updateDriver(this.driverId, updatedDriverPayload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/drivers']); // Success ke baad drivers list par redirect karna
        },
        error: (err) => {
          console.error('Failed to update driver:', err);
          this.errorMessage = err?.error?.message || 'Failed to update driver details. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      // Agar form invalid ho toh saare fields ko touched mark kar dena taake validation errors show hon
      this.driverForm.markAllAsTouched();
    }
  }
}