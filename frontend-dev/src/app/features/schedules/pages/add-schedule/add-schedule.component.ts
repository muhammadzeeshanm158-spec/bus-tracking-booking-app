import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ScheduleService } from '../../services/schedule.service';
import { BusService } from '../../../buses/services/bus.service';
import { RouteService } from '../../../routes/services/route.service';
import { DriverService } from '../../../drivers/services/driver.service';
import { Schedule } from '../../models/schedule.model';
import { Bus } from '../../../buses/models/bus.model';
import { Route } from '../../../routes/models/route.model';
import { Driver } from '../../../drivers/models/driver.model';

@Component({
  selector: 'app-add-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-schedule.component.html',
  styleUrls: ['./add-schedule.component.css']
})
export class AddScheduleComponent implements OnInit {
  private fb = inject(FormBuilder);
  private scheduleService = inject(ScheduleService);
  private busService = inject(BusService);
  private routeService = inject(RouteService);
  private driverService = inject(DriverService);
  private router = inject(Router);

  isSubmitting = false;
  errorMessage = '';

  routes: Route[] = [];
  buses: Bus[] = [];
  drivers: Driver[] = [];

  scheduleForm: FormGroup = this.fb.group({
    routeId: ['', Validators.required],
    busId: ['', Validators.required],
    driverId: [''],
    departureDate: ['', Validators.required],
    departureTime: ['', Validators.required],
    arrivalTime: ['', Validators.required],
    fare: [2500, [Validators.required, Validators.min(1)]],
    status: ['Scheduled', Validators.required]
  });

  get f() {
    return this.scheduleForm.controls;
  }

  ngOnInit(): void {
    this.loadDropdownData();
  }

  loadDropdownData(): void {
    // 1. Load Buses
    this.busService.getBuses().subscribe({
      next: (response: { data?: Bus[] } | Bus[]) => {
        this.buses = Array.isArray(response) ? response : (response.data ?? []);
      },
      error: (err) => {
        console.error('Error loading buses:', err);
        this.buses = [];
      }
    });

    // 2. Load Routes (Route module integration)
    this.routeService.getAllRoutes().subscribe({
      next: (response: { data?: Route[] } | Route[]) => {
        this.routes = Array.isArray(response) ? response : (response.data ?? []);
      },
      error: (err) => {
        console.error('Error loading routes:', err);
        this.routes = [];
      }
    });


 
    // 3. Load Drivers
    this.driverService.getDrivers().subscribe({
      next: (response: { data?: Driver[] } | Driver[]) => {
        this.drivers = Array.isArray(response) ? response : (response.data ?? []);
      },
      error: (err) => {
        console.error('Error loading drivers:', err);
        this.drivers = [];
      }
    });
  }

  onSubmit(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    const formValues = this.scheduleForm.value;

    const selectedRoute = this.routes.find(r => r.id?.toString() === formValues.routeId?.toString());
    const selectedBus = this.buses.find(b => b.id?.toString() === formValues.busId?.toString());
    const selectedDriver = this.drivers.find(d => d.id?.toString() === formValues.driverId?.toString());

    const busRecord = selectedBus as unknown as Record<string, unknown>;
    const busNumberVal = (busRecord?.['busNumber'] || busRecord?.['bus_number'] || 'N/A') as string;
    const busTypeVal = (busRecord?.['busType'] || busRecord?.['bus_type'] || 'Standard') as string;
    const totalSeatsVal = (busRecord?.['totalSeats'] || busRecord?.['total_seats'] || 40) as number;

    const newScheduleData: Omit<Schedule, 'id' | 'scheduleCode'> = {
      busId: formValues.busId,
      busNumber: busNumberVal,
      busType: busTypeVal,
      routeId: formValues.routeId,
      routeName: selectedRoute ? `${selectedRoute.origin} to ${selectedRoute.destination}` : 'N/A',
      departureCity: selectedRoute?.origin ?? '',
      arrivalCity: selectedRoute?.destination ?? '',
      driverId: formValues.driverId || '',
      driverName: selectedDriver ? selectedDriver.name : 'Unassigned',
      departureDate: formValues.departureDate,
      departureTime: formValues.departureTime,
      arrivalTime: formValues.arrivalTime,
      fare: formValues.fare,
      totalSeats: totalSeatsVal,
      availableSeats: totalSeatsVal,
      status: formValues.status
    };

    this.scheduleService.addSchedule(newScheduleData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/schedules']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
      }
    });
  }
}