import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Schedule } from '../../models/schedule.model';
import { ScheduleService } from '../../services/schedule.service';

@Component({
  selector: 'app-view-schedule',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view-schedule.component.html',
  styleUrls: ['./view-schedule.component.css']
})
export class ViewScheduleComponent implements OnInit {
  // Dependency Injection: URL se id read karne ke liye ActivatedRoute aur API call ke liye ScheduleService
  private route = inject(ActivatedRoute);
  private scheduleService = inject(ScheduleService);

  // Component State Variables
  schedule: Schedule | null = null;   // Single schedule ki detail store karne ke liye
  isLoading = true;                    // Data fetch hotay waqt loader show karne ke liye
  errorMessage = '';                   // Agar koi error aaye toh message display karne ke liye

  /**
   * LIFECYCLE HOOK: ngOnInit
   * Component load hotay hi URL params se schedule ki ID nikal kar details fetch karna
   */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadScheduleDetails(id);
    } else {
      this.isLoading = false;
      this.errorMessage = 'Invalid schedule ID.';
    }
  }

  /**
   * BACKEND API: Fetch Single Schedule by ID
   * Server se specific schedule ka mukammal data mangwana
   */
  private loadScheduleDetails(id: string): void {
    this.isLoading = true;
    this.scheduleService.getScheduleById(id).subscribe({
      next: (response: Schedule | unknown) => {
        if (response) {
          const resRecord = response as Record<string, unknown>;
          
          // Extract data from wrapper { success: true, data: { ... } } or fallback to direct response
          const data = (resRecord['data'] ? resRecord['data'] : response) as Record<string, unknown>;

          if (data) {
            const routeObj = data['route'] as Record<string, unknown> | undefined;
            const busObj = data['bus'] as Record<string, unknown> | undefined;
            const driverObj = data['driver'] as Record<string, unknown> | undefined;

            const depCity = (data['departureCity'] || data['departure_city'] || routeObj?.['origin'] || '') as string;
            const arrCity = (data['arrivalCity'] || data['arrival_city'] || routeObj?.['destination'] || '') as string;

            this.schedule = {
              ...(data as unknown as Schedule),
              departureCity: depCity,
              arrivalCity: arrCity,
              routeName: (data['routeName'] || data['route_name'] || (depCity && arrCity ? `${depCity} ➔ ${arrCity}` : 'Route Details')) as string,
              
              scheduleCode: (data['scheduleCode'] || data['schedule_code'] || data['code'] || data['id'] || '') as string,
              
              departureTime: (data['departureTime'] || data['departure_time'] || '') as string,
              arrivalTime: (data['arrivalTime'] || data['arrival_time'] || '') as string,
              departureDate: (data['departureDate'] || data['departure_date'] || '') as string,

              availableSeats: Number(data['availableSeats'] ?? data['available_seats'] ?? 0),
              totalSeats: Number(data['totalSeats'] ?? data['total_seats'] ?? busObj?.['total_seats'] ?? 40),
              fare: Number(data['fare'] || data['fare_price'] || data['price'] || 0),

              busId: (data['busId'] || data['bus_id'] || busObj?.['id'] || '') as string,
              busNumber: (data['busNumber'] || data['bus_number'] || busObj?.['bus_number'] || 'N/A') as string,
              busType: (data['busType'] || data['bus_type'] || busObj?.['bus_type'] || 'Standard') as string,

              driverId: (data['driverId'] || data['driver_id'] || driverObj?.['id'] || '') as string,
              driverName: (data['driverName'] || data['driver_name'] || driverObj?.['name'] || 'Unassigned') as string,
              
              status: (data['status'] || 'Scheduled') as Schedule['status']
            };
          } else {
            this.schedule = null;
          }
        } else {
          this.schedule = null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load schedule details:', err);
        this.errorMessage = 'Failed to load schedule details from server.';
        this.isLoading = false;
      }
    });
  }

  // =========================================================================
  // STATUS HELPERS (UI Styling for Badges and Indicator Dots)
  // =========================================================================

  // Status ke mutabiq badge ka background, text, aur border color return karna
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'On-Time':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Delayed':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  // Status ke mutabiq small indicator dot ka color return karna
  getStatusDotClass(status: string): string {
    switch (status) {
      case 'On-Time':
        return 'bg-emerald-500';
      case 'Scheduled':
        return 'bg-amber-500';
      case 'Delayed':
        return 'bg-orange-500';
      case 'Completed':
        return 'bg-slate-500';
      case 'Cancelled':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  }
}