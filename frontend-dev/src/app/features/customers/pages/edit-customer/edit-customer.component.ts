import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  selector: 'app-edit-customer',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.css']
})
export class EditCustomerComponent implements OnInit {
  
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerService = inject(CustomerService);

  customerId: string | null = null;
  isLoading = true;
  errorMessage = '';
  isSubmitting = false;

  // Normalized form default values to match HTML option values
  customerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone_number: ['', [Validators.required, CustomValidators.phoneNumber()]],
    cnic: ['', [CustomValidators.cnic()]],
    gender: ['male', [Validators.required]],
    dob: [''],
    emergency_contact_name: [''],
    emergency_contact_phone: ['', [CustomValidators.phoneNumber()]],
    status: ['active'],
    address: ['']
  });

  get f() {
    return this.customerForm.controls;
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id');

    if (this.customerId) {
      this.loadCustomerDetails(this.customerId);
    }
  }

  // =========================================================================
  // FETCH & PATCH CUSTOMER DATA
  // =========================================================================
  loadCustomerDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.customerService.getCustomerById(id).subscribe({
      next: (customer: Customer) => {
        // Normalize status value to lower-case to align with HTML option values
        const normalizedStatus = (customer.status || 'active').toLowerCase();
        const normalizedGender = (customer.gender || 'male').toLowerCase();

        this.customerForm.patchValue({
          name: customer.name || '',
          email: customer.email || '',
          phone_number: customer.phone_number || customer.phone || '',
          cnic: customer.cnic || '',
          gender: normalizedGender,
          dob: customer.dob || '',
          emergency_contact_name: customer.emergency_contact_name || customer.emergencyContactName || '',
          emergency_contact_phone: customer.emergency_contact_phone || customer.emergencyContactPhone || '',
          status: normalizedStatus,
          address: customer.address || ''
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load customer details:', err);
        this.errorMessage = 'Failed to load customer details from server. Please refresh or try again.';
        this.isLoading = false;
      }
    });
  }

  // =========================================================================
  // SUBMIT UPDATED FORM
  // =========================================================================
  onSubmit(): void {
    if (this.customerForm.valid && this.customerId) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const updatedData: Partial<Customer> = this.customerForm.value;

      this.customerService.updateCustomer(this.customerId, updatedData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/customers']);
        },
        error: (err) => {
          console.error('Failed to update customer:', err);
          this.errorMessage = 'Failed to update customer details. Please verify your connection and try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.customerForm.markAllAsTouched();
    }
  }
}