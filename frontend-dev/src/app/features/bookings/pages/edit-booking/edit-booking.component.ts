import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-edit-booking',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './edit-booking.component.html',
  styleUrl: './edit-booking.component.css'
})
export class EditBookingComponent implements OnInit {
  // Dependency Injection using Angular's inject function
  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  editForm!: FormGroup;
  bookingId!: string;
  isSubmitting = false;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    // Get the booking ID from the route parameters
    this.bookingId = this.route.snapshot.paramMap.get('id') || '';

    // Initialize the Reactive Form with validations strictly aligned with Booking model
    this.editForm = this.fb.group({
      routeSelection: ['', Validators.required],
      assignedSeats: ['', Validators.required],
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      customerPhone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{10,15}$/)]],
      cnic: ['', [Validators.pattern(/^\s*\d{5}-\d{7}-\d{1}\s*$/)]],
      totalAmount: [0, [Validators.required, Validators.min(1)]],
      paymentMethod: ['easypaisa', Validators.required],
      bookingStatus: ['Confirmed', Validators.required]
    });

    // Load booking details if ID exists, otherwise show error
    if (this.bookingId) {
      this.loadBookingDetails();
    } else {
      this.errorMessage = 'Invalid booking ID provided.';
      this.isLoading = false;
    }
  }

  // Fetch existing booking data strictly typed with Booking interface
  loadBookingDetails(): void {
    console.log('Fetching booking with ID:', this.bookingId);

    this.bookingService.getBookingById(this.bookingId).subscribe({
      next: (response: Booking | { success: boolean; message: string; data: Booking }) => {
        console.log('API se yeh Data aya hai:', response);

        // Handle wrapper object strictly adhering to Booking interface types
        const bookingData: Booking = ('data' in response && response.data) ? response.data : (response as Booking);

        // Extract seats array safely using model properties
        const seats = bookingData.seatNumbers || bookingData.seat_numbers || [];

        // Determine route value using model properties with fallback
        const resolvedRoute = bookingData.routeOrigin || 
                              bookingData.route_origin || 
                              (bookingData.scheduleId === 1 ? 'Lahore ➔ Islamabad (08:00 AM • BS-102)' : '') ||
                              'Lahore ➔ Islamabad (08:00 AM • BS-102)';

        this.editForm.patchValue({
          routeSelection: resolvedRoute,
          assignedSeats: Array.isArray(seats) ? seats.join(', ') : '',
          customerName: bookingData.customerName || bookingData.customer_name || '',
          customerPhone: bookingData.customerPhone || bookingData.customer_phone || '',
          cnic: bookingData.cnic || bookingData.cnicNumber || bookingData.cnic_number || '',
          totalAmount: bookingData.totalAmount || 0,
          paymentMethod: bookingData.paymentMethod || bookingData.payment_method || 'easypaisa',
          bookingStatus: bookingData.bookingStatus || 'Confirmed'
        });

        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Failed to load booking details:', err);
        this.errorMessage = 'Failed to load booking details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Handle form submission using strictly-typed Partial<Booking> payload
 // Handle form submission and update booking details strictly typed
  onSubmit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.errorMessage = 'Please fill out all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValues = this.editForm.value;

    // Seats ko string se split kar ke clean strings ki array banayein (jaise ['A1', 'A2'])
    const seatsArray = typeof formValues.assignedSeats === 'string' 
      ? formValues.assignedSeats.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      : formValues.assignedSeats;

    // Strictly typed payload aligned with Booking interface and backend expectations
    const payload: Partial<Booking> = {
      routeOrigin: formValues.routeSelection,
      route_origin: formValues.routeSelection,
      seat_numbers: seatsArray,
      seatNumbers: seatsArray as unknown as number[], // Type assertion to satisfy interface if numbers expected
      totalAmount: Number(formValues.totalAmount),
      bookingStatus: formValues.bookingStatus,
      customerName: formValues.customerName,
      customer_name: formValues.customerName,
      customerPhone: formValues.customerPhone,
      customer_phone: formValues.customerPhone,
      cnic: formValues.cnic,
      cnicNumber: formValues.cnic,
      cnic_number: formValues.cnic,
      paymentMethod: formValues.paymentMethod,
      payment_method: formValues.paymentMethod
    };

    console.log('Sending Fixed Update Payload:', payload);

    this.bookingService.updateBooking(this.bookingId, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/bookings']);
      },
      error: (err: unknown) => {
        console.error('Failed to update booking:', err);
        this.errorMessage = 'Failed to update booking. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}