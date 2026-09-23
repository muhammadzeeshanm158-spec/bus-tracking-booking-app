import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { SocketService } from '../../../../core/services/socket.service';
import { Booking } from '../../models/booking.model';
import { Subscription } from 'rxjs';

interface SeatBookedEventPayload {
  scheduleId: number | string;
  bookingId?: number | string;
  seatNumbers: (number | string)[];
  message?: string;
}

@Component({
  selector: 'app-create-booking',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './create-booking.component.html',
  styleUrl: './create-booking.component.css'
})
export class CreateBookingComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  private socketService = inject(SocketService);
  private router = inject(Router);

  bookingForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  // Bus available seats list & real-time booked seats tracking
  availableSeats: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];
  selectedSeats: string[] = [];
  bookedSeats: string[] = [];

  private subs: Subscription[] = [];
  
  // Per seat fixed ticket fare price
  readonly seatPrice: number = 2500;

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      scheduleId: ['', Validators.required],
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      customerPhone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{10,15}$/)]],
      cnic: ['', [Validators.pattern(/^\s*\d{5}-\d{7}-\d{1}\s*$/)]],
      paymentMethod: ['cash', Validators.required],
      paymentStatus: ['Pending', Validators.required],
      totalAmount: [0, [Validators.required, Validators.min(1)]]
    });

    // Schedule change hone par dynamic schedule room join karna
    this.subs.push(
      this.bookingForm.get('scheduleId')!.valueChanges.subscribe((scheduleId) => {
        if (scheduleId) {
          this.socketService.joinRoom(`schedule_${scheduleId}`);
          // Yahan aap API call karke us schedule ki already booked seats bhi fetch kar sakte hain agar zaroorat ho
        }
      })
    );

    // Real-time WebSocket listener for booked seats
    this.subs.push(
      this.socketService.onEvent<SeatBookedEventPayload>('seat_booked').subscribe((data) => {
        const currentScheduleId = this.bookingForm.get('scheduleId')?.value;
        
        if (data && String(data.scheduleId) === String(currentScheduleId)) {
          if (data.seatNumbers && Array.isArray(data.seatNumbers)) {
            data.seatNumbers.forEach((seatNum) => {
              const seatStr = String(seatNum);
              if (!this.bookedSeats.includes(seatStr)) {
                this.bookedSeats.push(seatStr);
              }
              // Agar current user ne wahi seat select ki thi jo kisi aur ne book kar li, toh usay unselect kar dein
              const index = this.selectedSeats.indexOf(seatStr);
              if (index > -1) {
                this.selectedSeats.splice(index, 1);
              }
            });

            // Total amount recalculate karein
            const calculatedTotal = this.selectedSeats.length * this.seatPrice;
            this.bookingForm.patchValue({ totalAmount: calculatedTotal });
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  // Seat toggle karne aur automatically total fare update karne ka method
  toggleSeat(seat: string): void {
    if (this.isSeatBooked(seat)) return;

    const index = this.selectedSeats.indexOf(seat);
    if (index > -1) {
      this.selectedSeats.splice(index, 1);
    } else {
      this.selectedSeats.push(seat);
    }

    const calculatedTotal = this.selectedSeats.length * this.seatPrice;
    this.bookingForm.patchValue({ totalAmount: calculatedTotal });
  }

  isSeatSelected(seat: string): boolean {
    return this.selectedSeats.includes(seat);
  }

  isSeatBooked(seat: string): boolean {
    return this.bookedSeats.includes(seat);
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.selectedSeats.length === 0) {
      this.errorMessage = 'Please select at least one seat from the bus layout.';
      return;
    }

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.errorMessage = 'Please fill out all required fields correctly (Schedule, Name, Phone).';
      return;
    }

    this.isSubmitting = true;

    const formValues = this.bookingForm.value;
    const payload: Partial<Booking> = {
      scheduleId: Number(formValues.scheduleId),
      customerName: formValues.customerName,
      customerPhone: formValues.customerPhone,
      cnic: formValues.cnic || '',
      totalAmount: Number(formValues.totalAmount),
      seatNumbers: this.selectedSeats.map(s => Number(s)),
      bookingStatus: formValues.paymentStatus === 'Paid' ? 'Confirmed' : 'Pending'
    };

    this.bookingService.addBooking(payload).subscribe({
      next: (response) => {
        console.log('Booking response:', response);
        this.isSubmitting = false;
        this.router.navigate(['/bookings']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to create booking API error:', err);
        this.errorMessage = err?.error?.message || 'Failed to process booking. Seat might already be booked.';
        this.isSubmitting = false;
      }
    });
  }
}

