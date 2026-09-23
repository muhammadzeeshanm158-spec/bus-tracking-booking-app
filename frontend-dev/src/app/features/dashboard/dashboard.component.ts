/**
 * @file dashboard.component.ts
 * @description Multi-role Dashboard Component (Customer, Driver, aur Admin ke liye accounting aur management stats ke sath)
 */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { BookingService, PaginatedBookingsResponse } from '../bookings/services/booking.service';
import { Booking } from '../bookings/models/booking.model';
import { AuthService } from '../../core/authService/auth.service';
import { ScheduleService } from '../schedules/services/schedule.service';
import { Schedule } from '../schedules/models/schedule.model';
import { ReportsService } from '../reports/services/reports/service/reports.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private bookingService = inject(BookingService);
  private scheduleService = inject(ScheduleService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private routerSubscription!: Subscription;
  private reportsService = inject(ReportsService);

  currentUserRole = 'customer'; // Default role
  currentUserName = 'User';

  // Stats arrays for different roles
  stats = [
    { title: 'My Total Bookings', count: 0, icon: '🎟️', bg: 'bg-blue-500' },
    { title: 'Active Tickets', count: 0, icon: '🚍', bg: 'bg-amber-500' },
    { title: 'Completed Trips', count: 0, icon: '✅', bg: 'bg-emerald-500' },
    { title: 'Saved Passes', count: 0, icon: '⭐', bg: 'bg-purple-500' }
  ];

  recentBookings: Booking[] = [];
  assignedSchedules: Schedule[] = [];
  isLoading = true;

  ngOnInit(): void {
    // 1. User role aur full_name get karein
    const user = this.authService.currentUser();
    if (user) {
      this.currentUserRole = user.role ? user.role.toLowerCase() : 'customer';
      this.currentUserName = user.full_name || user.email || 'User';
    }

    // 2. Role ke mutabiq data load karein
    this.loadDashboardData();

    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadDashboardData();
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private setFallbackStats(scheduleCount: number): void {
    this.stats = [
      { title: 'Total Schedules', count: scheduleCount, icon: '📅', bg: 'bg-blue-500' },
      { title: 'Active Routes', count: 0, icon: '🚍', bg: 'bg-amber-500' },
      { title: 'System Users', count: 0, icon: '👥', bg: 'bg-emerald-500' },
      { title: 'Total Revenue (PKR)', count: 0, icon: '💰', bg: 'bg-purple-500' }
    ];
    this.isLoading = false;
  }

  loadDashboardData(): void {
    this.isLoading = true;

    if (this.currentUserRole === 'customer') {
      // --- CUSTOMER DASHBOARD DATA ---
      this.bookingService.getBookings(1, 5).subscribe({
        next: (response: PaginatedBookingsResponse | { data: PaginatedBookingsResponse }) => {
          const responseData: PaginatedBookingsResponse = 'data' in response ? response.data : response;
          const bookings: Booking[] = responseData?.bookings || [];
          
          this.recentBookings = bookings;
          const totalCount = responseData?.totalBookings || bookings.length;

          this.stats = [
            { title: 'My Total Bookings', count: totalCount, icon: '🎟️', bg: 'bg-blue-500' },
            { title: 'Active Tickets', count: bookings.filter((b: Booking) => b.bookingStatus === 'Pending' || b.bookingStatus === 'Confirmed').length, icon: '🚍', bg: 'bg-amber-500' },
            { title: 'Completed Trips', count: bookings.filter((b: Booking) => b.bookingStatus === 'Completed').length, icon: '✅', bg: 'bg-emerald-500' },
            { title: 'Saved Passes', count: 0, icon: '⭐', bg: 'bg-purple-500' }
          ];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load customer dashboard data', err);
          this.isLoading = false;
        }
      });
    } else if (this.currentUserRole === 'driver') {
      // --- DRIVER DASHBOARD DATA ---
      this.scheduleService.getSchedules().subscribe({
        next: (response: Schedule[] | { data: Schedule[] }) => {
          let allSchedules: Schedule[] = [];
          if (Array.isArray(response)) {
            allSchedules = response;
          } else if (response && Array.isArray(response.data)) {
            allSchedules = response.data;
          }

          this.assignedSchedules = allSchedules; 

          this.stats = [
            { title: 'Assigned Duties', count: this.assignedSchedules.length, icon: '🚍', bg: 'bg-blue-500' },
            { title: 'Active Trips', count: this.assignedSchedules.filter((s: Schedule) => s.status === 'On-Time').length, icon: '⏳', bg: 'bg-amber-500' },
            { title: 'Completed Trips', count: this.assignedSchedules.filter((s: Schedule) => s.status === 'Completed').length, icon: '✅', bg: 'bg-emerald-500' },
            { title: 'Total Routes', count: this.assignedSchedules.length, icon: '🗺️', bg: 'bg-purple-500' }
          ];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load driver dashboard data', err);
          this.isLoading = false;
        }
      });
    } else {
      // --- ADMIN ACCOUNTING & MANAGEMENT DASHBOARD DATA ---
      // Schedules aur Reports summary dono ko ek sath fetch kar rahe hain
      this.scheduleService.getSchedules().subscribe({
        next: (scheduleResponse: Schedule[] | { data: Schedule[] }) => {
          let schedules: Schedule[] = [];
          if (Array.isArray(scheduleResponse)) {
            schedules = scheduleResponse;
          } else if (scheduleResponse && Array.isArray(scheduleResponse.data)) {
            schedules = scheduleResponse.data;
          }

          // Ab Reports Service se real users aur revenue fetch karein
          this.reportsService.getReportSummary().subscribe({
            next: (reportResponse) => {
              const summary = reportResponse.data;

              this.stats = [
                { title: 'Total Schedules', count: schedules.length, icon: '📅', bg: 'bg-blue-500' },
                { title: 'Active Routes', count: schedules.filter((s: Schedule) => s.status === 'On-Time').length, icon: '🚍', bg: 'bg-amber-500' },
                { title: 'System Users', count: summary?.totalCustomers ?? 0, icon: '👥', bg: 'bg-emerald-500' }, // <-- Real database count
                { title: 'Total Revenue (PKR)', count: summary?.totalRevenue ?? 0, icon: '💰', bg: 'bg-purple-500' } // <-- Real database revenue
              ];
              this.isLoading = false;
            },
            error: () => {
              // Agar reports fail ho jayein toh schedules ke sath default 0 set karein
              this.setFallbackStats(schedules.length);
            }
          });
        },
        error: () => { 
          this.setFallbackStats(0);
        }
      });
    }
  }
}