import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-view-booking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view-booking.component.html',
  styleUrl: './view-booking.component.css'
})
export class ViewBookingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);

  booking: Booking | null = null;
  isLoading = true;
  errorMessage = '';

get bookingData(): Booking {
    if (!this.booking) {
      return {
        id: 0,
        booking_number: '',
        userId: 0,
        scheduleId: 0,
        totalAmount: 0,
        bookingStatus: 'Pending',
        customerName: '',
        customerPhone: '',
        cnicNumber: 'N/A'
      };
    }
    
    return {
      ...this.booking,
      payment_status: this.booking.payment_status || this.booking.paymentStatus || 'Pending',
      paymentStatus: this.booking.paymentStatus || this.booking.payment_status || 'Pending',
      created_at: this.booking.created_at || this.booking.createdAt,
      createdAt: this.booking.createdAt || this.booking.created_at,
      departure_time: this.booking.departure_time || this.booking.departureTime || '08:00 AM',
      departureTime: this.booking.departureTime || this.booking.departure_time || '08:00 AM',
      travel_date: this.booking.travel_date || this.booking.travelDate || '',
      travelDate: this.booking.travelDate || this.booking.travel_date || '',
      cnicNumber: this.booking.cnicNumber || this.booking.cnic_number || this.booking.cnic || 'N/A',
      cnic_number: this.booking.cnic_number || this.booking.cnicNumber || this.booking.cnic || 'N/A',
      seat_numbers: this.booking.seat_numbers || this.booking.seatNumbers || [],
      seatNumbers: this.booking.seatNumbers || this.booking.seat_numbers || [],
      payment_method: this.booking.payment_method || this.booking.paymentMethod || 'Cash',
      paymentMethod: this.booking.paymentMethod || this.booking.payment_method || 'Cash'
    };
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBookingDetails(id);
    } else {
      this.errorMessage = 'Invalid booking ID provided.';
      this.isLoading = false;
    }
  }

  loadBookingDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookingService.getBookingById(id).subscribe({
      next: (response: Booking | { data?: Booking }) => {
        if (response && typeof response === 'object' && 'data' in response && response.data) {
          this.booking = response.data;
        } else if (response) {
          this.booking = response as Booking;
        } else {
          this.booking = null;
        }
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Failed to fetch booking details:', err);
        const errorObj = err as { error?: { message?: string } };
        this.errorMessage = errorObj?.error?.message || 'Failed to load booking details from the server.';
        this.isLoading = false;
      }
    });
  }

  printTicket(): void {
    window.print();
  }

  printInvoice(): void {
    window.print();
  }
}