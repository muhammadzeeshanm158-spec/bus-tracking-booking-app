/**
 * @file schedule-list.component.ts
 * @description Schedule Management List Component (Role-based access, filtering, stats, aur delete functionality ke sath)
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScheduleService } from '../../services/schedule.service';
import { AuthService } from '../../../../core/authService/auth.service'; // 👈 AuthService import kar liya hai role check karne ke liye
import { Schedule } from '../../models/schedule.model';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.css']
})
export class ScheduleListComponent implements OnInit {
  // Dependency Injection: Schedule API aur Auth service inject karna
  private scheduleService = inject(ScheduleService);
  private authService = inject(AuthService); // 👈 AuthService inject kiya gaya hai

  // Component State & Role Variable
  currentUserRole = '';                // Logged-in user ka role track karne ke liye ('admin', 'driver', etc.)
  schedules: Schedule[] = [];          // Backend se aane wala mukammal data
  filteredSchedules: Schedule[] = [];  // Search aur filters apply honay ke baad display honay wala data

  // Filter States (User ki search aur filters ko track karne ke liye)
  searchTerm = '';
  selectedRoute = '';
  selectedDate = '';
  selectedStatus = '';
  isLoading = false;                   // Data load hotay waqt loader show karne ke liye
  errorMessage = '';                   // Agar API call mein error aaye

  // Options Array (Routes ka data dropdown ke liye)
  routes: { id: string; name: string }[] = [];

  /**
   * LIFECYCLE HOOK: ngOnInit
   * Component load hotay hi user ka role set karna aur schedules ka data fetch karna
   */
  ngOnInit(): void {
    // 1. AuthService ke signal se current user ka role nikal kar lowercase mein set kar rahe hain
    const user = this.authService.currentUser();
    if (user && user.role) {
      this.currentUserRole = user.role.toLowerCase();
    }

    // 2. Schedules load karna
    this.loadSchedules();
  }

  /**
   * BACKEND API: Fetch All Schedules
   * Server se tamam schedules ki list mangwana aur response handle karna
   */
  loadSchedules(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.scheduleService.getSchedules().subscribe({
      next: (response: Schedule[] | { data: Schedule[] }) => {
        // Check karein ke response direct array hai ya object jisme 'data' property hai
        if (Array.isArray(response)) {
          this.schedules = response;
        } else if (response && Array.isArray(response.data)) {
          this.schedules = response.data;
        } else {
          this.schedules = [];
        }

        this.filteredSchedules = [...this.schedules];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load schedules:', err);
        this.errorMessage = 'Failed to load schedules from server.';
        this.schedules = [];
        this.filteredSchedules = [];
        this.isLoading = false;
      }
    });
  }

  // =========================================================================
  // 1. TABLE RENDERING HELPER
  // =========================================================================
  // Ye getter decide karta hai ke table mein original list dikhegi ya filtered list
  get displaySchedules(): Schedule[] {
    if (this.searchTerm || this.selectedRoute || this.selectedStatus || this.selectedDate) {
      return this.filteredSchedules;
    }
    return this.schedules;
  }

  // =========================================================================
  // 2. OVERVIEW STATS GETTERS (Dashboard Counters)
  // =========================================================================
  
  // Kul schedules ki taadad
  get totalSchedulesCount(): number {
    return this.schedules ? this.schedules.length : 0;
  }

  // On-Time (Active) schedules ki taadad
  get activeCount(): number {
    if (!this.schedules) return 0;
    return this.schedules.filter(s => s.status === 'On-Time').length;
  }

  // Upcoming / Scheduled schedules ki taadad
  get upcomingCount(): number {
    if (!this.schedules) return 0;
    return this.schedules.filter(s => s.status === 'Scheduled').length;
  }

  // Cancelled ya Delayed schedules ki taadad
  get cancelledCount(): number {
    if (!this.schedules) return 0;
    return this.schedules.filter(s => s.status === 'Cancelled' || s.status === 'Delayed').length;
  }

  // =========================================================================
  // 3. STATUS BADGE & DOT HELPERS (UI Styling)
  // =========================================================================
  
  // Status ke mutabiq badge ka background aur text color return karna
  getStatusBadgeClass(status: Schedule['status'] | string): string {
    switch (status) {
      case 'On-Time':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Cancelled':
      case 'Delayed':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }

  // Status ke mutabiq small indicator dot ka color return karna
  getStatusDotClass(status: Schedule['status'] | string): string {
    switch (status) {
      case 'On-Time':
        return 'bg-emerald-500';
      case 'Scheduled':
        return 'bg-amber-500';
      case 'Completed':
        return 'bg-slate-500';
      case 'Cancelled':
      case 'Delayed':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  }

  // =========================================================================
  // 4. FILTERING & ACTIONS LOGIC
  // =========================================================================
  
  // Jab user search input mein kuch type kare
  onSearchChange(): void {
    this.applyFilters();
  }

  // Jab user route dropdown ka filter change kare
  onFilterChange(routeVal?: string): void {
    if (routeVal !== undefined && routeVal !== null) {
      this.selectedRoute = routeVal;
    }
    this.applyFilters();
  }

  // Tamam filters (Search, Route, Status, Date) ko combine kar ke list filter karna
  applyFilters(): void {
    this.filteredSchedules = this.schedules.filter(item => {
      const term = this.searchTerm.toLowerCase().trim();
      
      // Search term match check (Route name, bus number, schedule code, ya driver name)
      const matchSearch = !term || 
        item.routeName?.toLowerCase().includes(term) ||
        item.busNumber?.toLowerCase().includes(term) ||
        item.scheduleCode?.toLowerCase().includes(term) ||
        (item.driverName && item.driverName.toLowerCase().includes(term));

      // Route match check
      const matchRoute = !this.selectedRoute || 
        item.routeId === this.selectedRoute || 
        item.routeName === this.selectedRoute;

      // Status match check
      const matchStatus = !this.selectedStatus || 
        item.status.toLowerCase() === this.selectedStatus.toLowerCase();

      // Departure Date match check
      const matchDate = !this.selectedDate || 
        item.departureDate === this.selectedDate;

      return matchSearch && matchRoute && matchStatus && matchDate;
    });
  }

  /**
   * DELETE SCHEDULE METHOD
   * User se confirmation lene ke baad backend se schedule delete karna aur UI update karna
   */
  deleteSchedule(id: string): void {
    if (confirm('Are you sure you want to delete this schedule?')) {
      this.scheduleService.deleteSchedule(id).subscribe({
        next: () => {
          // Local array se delete honay walay schedule ko filter out karna
          this.schedules = this.schedules.filter(s => s.id !== id);
          this.applyFilters(); // Filters dobara apply karna taake UI sync rahe
        },
        error: (err) => {
          console.error('Failed to delete schedule:', err);
          alert('Failed to delete schedule from server.');
        }
      });
    }
  }
}