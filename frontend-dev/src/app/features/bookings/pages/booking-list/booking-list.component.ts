/**
 * @file booking-list.component.ts
 * @description Passenger ticket bookings list component jo saare bookings ko display, filter, aur manage karta hai.
 */

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

// API response structure ko type-safe banane ke liye interface
interface PaginatedBookingResponse {
  data?: {
    bookings?: Booking[];
  };
  bookings?: Booking[];
}

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.css'
})
export class BookingListComponent implements OnInit {
  // Dependency Injection Services
  private bookingService = inject(BookingService);
  private router = inject(Router);

  // Component State Variables
  bookings: Booking[] = [];
  isLoading = true;
  errorMessage = '';

  // Search & Filter Properties
  searchTerm = '';
  selectedRoute = '';
  selectedStatus = '';

  /**
   * @getter totalBookingsCount
   * @description Total bookings ki ginti return karta hai
   */
  get totalBookingsCount(): number {
    return this.bookings.length;
  }

  /**
   * @getter confirmedBookingsCount
   * @description Confirmed status wale bookings ki ginti return karta hai
   */
  get confirmedBookingsCount(): number {
    return this.bookings.filter(b => b.bookingStatus === 'Confirmed').length;
  }

  /**
   * @getter pendingPaymentCount
   * @description Pending payment wale bookings ki ginti return karta hai
   */
  get pendingPaymentCount(): number {
    return this.bookings.filter(b => b.payment_status === 'Pending' || b.paymentStatus === 'Pending').length;
  }

  /**
   * @getter cancelledBookingsCount
   * @description Cancelled bookings ki ginti return karta hai
   */
  get cancelledBookingsCount(): number {
    return this.bookings.filter(b => b.bookingStatus === 'Cancelled').length;
  }

  /**
   * @method ngOnInit
   * @description Component load hote hi bookings fetch karta hai
   */
  ngOnInit(): void {
    this.loadBookings();
  }

  /**
   * @method loadBookings
   * @description Server se saare bookings retrieve karta hai aur various formats handle karta hai
   */
  loadBookings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookingService.getBookings().subscribe({
      next: (response: Booking[] | PaginatedBookingResponse) => {
        if (Array.isArray(response)) {
          this.bookings = response;
        } else if (response && 'data' in response && response.data?.bookings && Array.isArray(response.data.bookings)) {
          this.bookings = response.data.bookings;
        } else if (response && 'bookings' in response && Array.isArray(response.bookings)) {
          this.bookings = response.bookings;
        } else {
          this.bookings = [];
        }
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load bookings:', err);
        this.errorMessage = err?.error?.message || 'Failed to load bookings from the server.';
        this.isLoading = false;
      }
    });
  }

  /**
   * @method navigateToCheckout
   * @description Checkout page par booking ID aur amount securely pass karta hai
   */
  navigateToCheckout(bookingId: string | number | undefined, ticketPrice: number | undefined): void {
    if (!bookingId) return;
    this.router.navigate(['/payments/checkout'], {
      state: { 
        bookingId: String(bookingId), 
        amount: ticketPrice || 0 
      }
    });
  }

  /**
   * @getter filteredBookings
   * @description Search term, route filter, aur status filter ke mutabiq bookings filter karta hai
   */
  get filteredBookings(): Booking[] {
    return this.bookings.filter(booking => {
      const bookingIdStr = booking.id ? String(booking.id) : '';
      const customerName = booking.customerName || booking.customer_name || '';
      const customerPhone = booking.customerPhone || booking.customer_phone || '';
      const busNum = booking.busNumber || booking.bus_number || '';
      const origin = booking.routeOrigin || booking.route_origin || '';
      const destination = booking.routeDestination || booking.route_destination || '';
      const status = booking.bookingStatus || '';

      const matchesSearch = 
        customerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        bookingIdStr.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customerPhone.includes(this.searchTerm) ||
        busNum.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        origin.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        destination.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRoute = this.selectedRoute 
        ? origin.toLowerCase().includes(this.selectedRoute.toLowerCase()) || 
          destination.toLowerCase().includes(this.selectedRoute.toLowerCase())
        : true;

      const matchesStatus = this.selectedStatus ? status === this.selectedStatus : true;

      return matchesSearch && matchesRoute && matchesStatus;
    });
  }

  /**
   * @method cancelBooking
   * @description Selected booking ko cancel karne ki request bhejta hai
   */
  cancelBooking(id: number | string | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(id).subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Failed to cancel booking:', err);
          alert(err?.error?.message || 'Failed to cancel booking.');
        }
      });
    }
  }

  /**
   * @method deleteBooking
   * @description Database se booking record permanently delete karta hai
   */
/**
   * @method deleteBooking
   * @description Database se booking record permanently delete karta hai
   */
  deleteBooking(id: number | string | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this booking record?')) {
      this.bookingService.deleteBooking(id).subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Failed to delete booking:', err);
          alert(err?.error?.message || 'Failed to delete booking.');
        }
      });
    }
  }
}