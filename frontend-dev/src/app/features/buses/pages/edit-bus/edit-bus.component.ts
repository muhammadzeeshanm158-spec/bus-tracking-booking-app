import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { BusService } from '../../services/bus.service';
import { Bus } from '../../models/bus.model';

@Component({
  selector: 'app-edit-bus',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './edit-bus.component.html',
  styleUrl: './edit-bus.component.css'
})
export class EditBusComponent implements OnInit {
  
  // =========================================================================
  // DEPENDENCY INJECTION
  // =========================================================================
  private fb = inject(FormBuilder);
  private busService = inject(BusService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // =========================================================================
  // COMPONENT STATE VARIABLES
  // =========================================================================
  busId = '';                         // Bus ID to edit
  isSubmitting = false;               // Loading state for submission button
  isLoading = true;                   // Loading state for initial data fetch
  errorMessage = '';                  // Error message display

  // =========================================================================
  // REACTIVE FORM GROUP INITIALIZATION
  // =========================================================================
  editBusForm: FormGroup = this.fb.group({
    bus_number: ['', [Validators.required, Validators.minLength(2)]],      // Bus Code/Number
    bus_name: ['', [Validators.required, Validators.minLength(3)]],         // Fleet/Bus Name
    bus_type: ['', [Validators.required]],                                  // Category Type
    registration_number: ['', [Validators.required]],                       // License Plate / Reg #
    total_seats: [40, [Validators.required, Validators.min(1)]],            // Capacity
    is_active: [true, [Validators.required]],                               // Status (true/false)
  });

  // =========================================================================
  // LIFECYCLE HOOK: ngOnInit
  // =========================================================================
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.busId = idParam;
      this.loadBusDetails(this.busId);
    } else {
      this.errorMessage = 'Invalid bus ID provided.';
      this.isLoading = false;
    }
  }

  // =========================================================================
  // FETCH BUS DETAILS METHOD: loadBusDetails
  // =========================================================================
  loadBusDetails(id: string): void {
    this.isLoading = true;
    this.busService.getBusById(id).subscribe({
      next: (bus: Bus) => {
        if (bus) {
          // Patching values into the form matching database keys (fixed bus_number mapping)
          this.editBusForm.patchValue({
            bus_number: bus.bus_number, // <-- Yahan bus_name ki jagah bus_number kar diya hai
            bus_name: bus.bus_name,
            bus_type: bus.bus_type,
            registration_number: bus.registration_number,
            total_seats: bus.total_seats,
            is_active: bus.is_active
          });
        }
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching bus details:', err);
        this.errorMessage = 'Failed to load bus details from server.';
        this.isLoading = false;
      }
    });
  }

  // =========================================================================
  // SUBMIT METHOD: onSubmit
  // =========================================================================
  onSubmit(): void {
    if (this.editBusForm.invalid) {
      this.editBusForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    const formVal = this.editBusForm.value;

    // Added bus_number so it doesn't get sent as null to the backend
    const updatedData: Partial<Bus> = {
      bus_number: formVal.bus_number, // <-- Yeh field add kar di gayi hai
      bus_name: formVal.bus_name,
      bus_type: formVal.bus_type,
      registration_number: formVal.registration_number,
      total_seats: Number(formVal.total_seats),
      is_active: formVal.is_active
    };

    this.busService.updateBus(this.busId, updatedData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/bus']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error updating bus:', err);
        this.errorMessage = err.error?.message || 'Failed to update bus details.';
        this.isSubmitting = false;
      }
    });
  }
}