/**
 * @file booking.service.ts
 * @description Booking management service with strict TypeScript typing.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';

export interface PaginatedBookingsResponse {
  bookings: Booking[];
  currentPage: number;
  totalPages: number;
  totalBookings: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/v1/bookings';

  getBookings(page = 1, limit = 100, bookingStatus?: string): Observable<PaginatedBookingsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (bookingStatus) {
      params = params.set('booking_status', bookingStatus);
    }

    return this.http.get<PaginatedBookingsResponse>(this.apiUrl, { params });
  }

  getBookingById(id: number | string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  searchBookings(keyword: string): Observable<Booking[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Booking[]>(`${this.apiUrl}/search`, { params });
  }

  addBooking(bookingData: Partial<Booking>): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, bookingData);
  }

  updateBooking(id: number | string, updatedBooking: Partial<Booking>): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}`, updatedBooking);
  }

/**
   * @method cancelBooking
   * @description Existing PUT route ke zariye booking status ko 'Cancelled' update karta hai
   */
  cancelBooking(id: number | string): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}`, { booking_status: 'Cancelled' });
  }

  deleteBooking(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}