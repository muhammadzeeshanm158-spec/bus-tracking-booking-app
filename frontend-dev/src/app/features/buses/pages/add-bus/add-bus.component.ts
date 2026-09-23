import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { BusService } from '../../services/bus.service';
import { Bus } from '../../models/bus.model';

@Component({
  selector: 'app-add-bus',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './add-bus.component.html',
  styleUrl: './add-bus.component.css'
})
export class AddBusComponent {
  
  // =========================================================================
  // DEPENDENCY INJECTION
  // =========================================================================
  private fb = inject(FormBuilder);
  private busService = inject(BusService);
  private router = inject(Router);

  // =========================================================================
  // COMPONENT STATE VARIABLES
  // =========================================================================
  isSubmitting = false;                     // Form submit hone par loading state
  errorMessage = '';                        // Agar API ya form validation mein error aaye

  // =========================================================================
  // REACTIVE FORM GROUP INITIALIZATION
  // =========================================================================
  busForm: FormGroup = this.fb.group({
    bus_number: ['', [Validators.required, Validators.minLength(2)]],      // Bus Code/Number (e.g. BUS-101)
    bus_name: ['', [Validators.required, Validators.minLength(3)]],         // Bus ka naam
    bus_type: ['Standard', [Validators.required]],                          // Bus ki category (Standard, Executive, Luxury)
    registration_number: ['', [Validators.required]],                       // Vehicle registration number
    total_seats: [40, [Validators.required, Validators.min(1), Validators.max(100)]], // Kul seats
    is_active: [true, [Validators.required]]                                // Operational status (true/false)
  });

  // =========================================================================
  // SUBMIT METHOD: onSubmit
  // =========================================================================
  onSubmit(): void {
    if (this.busForm.invalid) {
      this.busForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.busForm.value;

    // Backend payload ke exact mutabiq data tayyar karna
    const newBus: Omit<Bus, 'id'> & { bus_number: string } = {
      bus_number: formValue.bus_number,
      bus_name: formValue.bus_name,
      bus_type: formValue.bus_type,
      registration_number: formValue.registration_number,
      total_seats: Number(formValue.total_seats),
      is_active: formValue.is_active
    };

    // Bus Service ke zariye backend API par POST request bhejna
    this.busService.createBus(newBus).subscribe({
      next: (response: Bus) => {
        this.isSubmitting = false;
        console.log('Bus created successfully:', response);
        // Success ke baad bus list page par redirect karna
        this.router.navigate(['/bus']);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        console.error('Failed to add bus:', err);
        this.errorMessage = err.error?.message || 'Failed to add bus. Please try again.';
      }
    });
  }
}