import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
// FIXED: Removed .ts extension from import
import { CustomerService } from '../../services/customer.service.ts';
import { Customer } from '../../models/customer.model';

// =========================================================================
// CUSTOM VALIDATORS CLASS
// =========================================================================
class CustomValidators {
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      return /^((\+92)|(0092)|(0))?3\d{9}$/.test(value) || /^\+?\d{10,15}$/.test(value) 
        ? null 
        : { invalidPhone: true };
    };
  }

  static cnic(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      return /^(\d{5}-\d{7}-\d|\d{13})$/.test(value) ? null : { invalidCnic: true };
    };
  }
}

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.css']
})
export class AddCustomerComponent {
  
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private customerService = inject(CustomerService);

  isSubmitting = false;
  errorMessage = '';

  // REACTIVE FORM GROUP SETUP
  customerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone_number: ['', [Validators.required, CustomValidators.phoneNumber()]],
    cnic: ['', [CustomValidators.cnic()]],
    gender: ['male', [Validators.required]],
    dob: [''],
    emergency_contact_name: [''],
    emergency_contact_phone: ['', [CustomValidators.phoneNumber()]],
    status: ['Active'],
    address: ['']
  });

  get f() {
    return this.customerForm.controls;
  }

  // FORM SUBMISSION METHOD: onSubmit
  onSubmit() {
    console.log('--- SAVE BUTTON CLICKED ---');

    if (this.customerForm.invalid) {
      console.warn('Form is invalid. Errors:', this.getFormValidationErrors());
      this.customerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formVal = this.customerForm.value;

    // Full Name ko First Name aur Last Name mein break karna
    const nameParts = formVal.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const payload: Partial<Customer> = {
      first_name: firstName,
      last_name: lastName,
      name: formVal.name,
      email: formVal.email,
      phone: formVal.phone_number,
      phone_number: formVal.phone_number,
      cnic: formVal.cnic || null,
      gender: formVal.gender,
      dob: formVal.dob || null,
      emergency_contact_name: formVal.emergency_contact_name || null,
      emergency_contact_phone: formVal.emergency_contact_phone || null,
      address: formVal.address || null,
      status: formVal.status === 'inactive' || formVal.status === 'Inactive' ? 'Inactive' : 'Active',
      is_active: formVal.status !== 'inactive' && formVal.status !== 'Inactive'
    };

    console.log('Sending payload to backend:', payload);

    this.customerService.createCustomer(payload).subscribe({
      next: () => {
        console.log('Customer created successfully!');
        this.isSubmitting = false;
        this.router.navigate(['/customers']);
      },
      error: (err) => {
        console.error('Failed to create customer:', err);
        this.errorMessage = err?.error?.message || 'Failed to save customer. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  // Debug Helper to trace invalid controls easily in browser console
  private getFormValidationErrors() {
    const invalidControls: Record<string, ValidationErrors> = {};
    Object.keys(this.customerForm.controls).forEach(key => {
      const controlErrors = this.customerForm.get(key)?.errors;
      if (controlErrors) {
        invalidControls[key] = controlErrors;
      }
    });
    return invalidControls;
  }
}