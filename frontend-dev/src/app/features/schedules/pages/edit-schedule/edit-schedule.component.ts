import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ScheduleService } from '../../services/schedule.service';
import { RouteService } from '../../../routes/services/route.service';
import { DriverService } from '../../../drivers/services/driver.service';
import { BusService } from '../../../buses/services/bus.service';
import { Schedule } from '../../models/schedule.model';
import { Route } from '../../../routes/models/route.model';
import { Bus } from '../../../buses/models/bus.model';
import { Driver } from '../../../drivers/models/driver.model';

@Component({
  selector: 'app-edit-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-schedule.component.html',
  styleUrls: ['./edit-schedule.component.css'],
})
export class EditScheduleComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private scheduleService = inject(ScheduleService);
  private routeService = inject(RouteService);
  private driverService = inject(DriverService);
  private busService = inject(BusService);

  scheduleId!: string;
  scheduleCode = '';
  isSubmitting = false;
  isLoading = true;
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
    fare: [0, [Validators.required, Validators.min(1)]],
    totalSeats: [0, [Validators.required, Validators.min(1)]],
    availableSeats: [0, [Validators.required, Validators.min(0)]],
    status: ['Scheduled', Validators.required],
  });

  get f() {
    return this.scheduleForm.controls;
  }

  ngOnInit(): void {
    this.scheduleId = this.route.snapshot.paramMap.get('id') || '';
    if (this.scheduleId) {
      this.loadDropdownData();
    } else {
      this.errorMessage = 'Invalid Schedule ID.';
      this.isLoading = false;
    }
  }

  private loadDropdownData(): void {
    // 1. Load Routes
    this.routeService.getAllRoutes().subscribe({
      next: (response: Route[] | unknown) => {
        const resRec = response as Record<string, unknown>;
        const routeData = resRec?.['data'] ? resRec['data'] : response;
        this.routes = Array.isArray(routeData) ? routeData : [];

        // 2. Load Drivers
        this.driverService.getDrivers().subscribe({
          next: (driverResp: Driver[] | unknown) => {
            const driverRec = driverResp as Record<string, unknown>;
            const driverData = driverRec?.['data']
              ? driverRec['data']
              : driverResp;
            this.drivers = Array.isArray(driverData) ? driverData : [];

            // 3. Load Buses
            this.busService.getBuses().subscribe({
              next: (busResp: Bus[] | unknown) => {
                const busRec = busResp as Record<string, unknown>;
                const busData = busRec?.['data'] ? busRec['data'] : busResp;
                this.buses = Array.isArray(busData) ? busData : [];

                // 4. Finally load schedule details to patch form
                this.loadScheduleDetails();
              },
              error: (err: unknown) => {
                console.error('Failed to load buses:', err);
                this.buses = [];
                this.loadScheduleDetails();
              },
            });
          },
          error: (err: unknown) => {
            console.error('Failed to load drivers:', err);
            this.drivers = [];
            this.loadScheduleDetails();
          },
        });
      },
      error: (err: unknown) => {
        console.error('Failed to load routes:', err);
        this.routes = [];
        this.loadScheduleDetails();
      },
    });
  }

private loadScheduleDetails(): void {
    this.scheduleService.getScheduleById(this.scheduleId).subscribe({
      next: (response: Schedule | unknown) => {
        if (response) {
          const resRecord = response as Record<string, unknown>;
          const existingSchedule = (resRecord['data'] ? resRecord['data'] : response) as Schedule;

          if (existingSchedule) {
            this.scheduleCode = existingSchedule.scheduleCode || '';
            
            // 1. Fallback route handling
            if (existingSchedule.routeId && !this.routes.some(r => r.id === existingSchedule.routeId)) {
              const fallbackRoute: Route = {
                id: existingSchedule.routeId,
                origin: existingSchedule.departureCity || '',
                destination: existingSchedule.arrivalCity || '',
                distanceKm: 0,
                estimatedHours: '0h',
                stops: [],
                farePrice: existingSchedule.fare || 0,
                status: 'Active'
              };
              this.routes.push(fallbackRoute);
            }

            // 2. Fallback bus handling (Direct property access)
            if (existingSchedule.busId && existingSchedule.busNumber && !this.buses.some(b => String(b.id) === existingSchedule.busId)) {
              const fallbackBus: Bus = {
                id: Number(existingSchedule.busId) || 1,
                bus_number: existingSchedule.busNumber,
                bus_type: (existingSchedule.busType as 'Standard' | 'Executive' | 'Luxury') || 'Standard',
                total_seats: existingSchedule.totalSeats || 40,
                bus_name: existingSchedule.busNumber,
                registration_number: existingSchedule.busNumber,
                is_active: true
              };
              this.buses.push(fallbackBus);
            }

            // 3. Fallback driver handling (Direct property access)
            if (existingSchedule.driverId && existingSchedule.driverName && !this.drivers.some(d => d.id === existingSchedule.driverId)) {
              const fallbackDriver: Driver = {
                id: existingSchedule.driverId,
                name: existingSchedule.driverName,
                email: '',
                phone: '',
                cnic: '',
                address: '',
                licenseNumber: '',
                licenseCategory: 'HTV',
                experienceYears: 0,
                status: 'Available',
                joiningDate: ''
              };
              this.drivers.push(fallbackDriver);
            }

            this.scheduleForm.patchValue({
              routeId: existingSchedule.routeId || '',
              busId: existingSchedule.busId || '',
              driverId: existingSchedule.driverId || '',
              departureDate: existingSchedule.departureDate || '',
              departureTime: existingSchedule.departureTime || '',
              arrivalTime: existingSchedule.arrivalTime || '',
              fare: existingSchedule.fare || 0,
              totalSeats: existingSchedule.totalSeats || 40,
              availableSeats: existingSchedule.availableSeats ?? (existingSchedule.totalSeats || 40),
              status: existingSchedule.status || 'Scheduled'
            });
          }
        }
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Failed to load schedule details:', err);
        this.errorMessage = 'Could not load schedule details from server.';
        this.isLoading = false;
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
    const formVal = this.scheduleForm.value;

    const selectedRoute = this.routes.find((r) => r.id === formVal.routeId);
    const selectedBus = this.buses.find((b) => String(b.id) === formVal.busId);
    const selectedDriver = this.drivers.find((d) => d.id === formVal.driverId);

    const updatedSchedule: Partial<Schedule> = {
      routeId: formVal.routeId,
      routeName: selectedRoute
        ? `${selectedRoute.origin} ➔ ${selectedRoute.destination}`
        : '',
      departureCity: selectedRoute ? selectedRoute.origin : '',
      arrivalCity: selectedRoute ? selectedRoute.destination : '',
      busId: formVal.busId,
      busNumber: selectedBus ? selectedBus.bus_number : '',
      busType: selectedBus ? selectedBus.bus_type : 'Standard',
      driverId: formVal.driverId || undefined,
      driverName: selectedDriver ? selectedDriver.name : '',
      departureDate: formVal.departureDate,
      departureTime: formVal.departureTime,
      arrivalTime: formVal.arrivalTime,
      fare: formVal.fare,
      totalSeats: selectedBus ? selectedBus.total_seats : formVal.totalSeats,
      availableSeats: formVal.availableSeats,
      status: formVal.status,
    };
    this.scheduleService
      .updateSchedule(this.scheduleId, updatedSchedule)
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          console.log('Schedule Updated Successfully:', response);
          this.router.navigate(['/schedules']);
        },
        error: (err: { error?: { message?: string } }) => {
          this.isSubmitting = false;
          console.error('Failed to update schedule:', err);
          this.errorMessage =
            err.error?.message ||
            'Failed to update schedule. Please try again.';
        },
      });
  }
}
