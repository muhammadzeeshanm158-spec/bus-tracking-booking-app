import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RouteService } from '../../services/route.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Route } from '../../models/route.model';

@Component({
  selector: 'app-edit-route',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-route.component.html',
  styleUrl: './edit-route.component.css'
})
export class EditRouteComponent implements OnInit {
  
  private fb = inject(FormBuilder);
  private routeService = inject(RouteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  routeId = '';          
  isLoading = false;      
  isFetching = true;      
  errorMessage = '';      

 

  // =========================================================================
  // REACTIVE FORM INITIALIZATION (Matched with Add Route & Database Fields)
  // =========================================================================
  routeForm: FormGroup = this.fb.group({
    routeName: ['', [Validators.required, Validators.minLength(3)]],
    status: ['Active', [Validators.required]],
    sourceCityId: [null, [Validators.required]],
    destinationCityId: [null, [Validators.required]],
    distanceKm: [null, [Validators.required, Validators.min(1)]],
    estimatedHours: ['', [Validators.required]],
    farePrice: [null, [Validators.required, Validators.min(0)]],
    stops: ['']
  });

  ngOnInit(): void {
    this.routeId = this.route.snapshot.paramMap.get('id') || '';
    if (this.routeId) {
      this.loadRouteData(this.routeId);
    } else {
      this.errorMessage = 'Invalid route ID specified.';
      this.isFetching = false;
    }
  }

  /**
   * 1. LOAD ROUTE DATA: Server se specific route ka data la kar form fields mein patch karna
   */
  loadRouteData(id: string): void {
    this.isFetching = true;
    this.routeService.getRouteById(id).subscribe({
      next: (routeData: Route) => {
        const stopsString = Array.isArray(routeData.stops) 
          ? routeData.stops.join(', ') 
          : '';

        this.routeForm.patchValue({
          routeName: routeData.routeName || '',
          status: routeData.status || 'Active',
          sourceCityId: routeData.sourceCityId,
          destinationCityId: routeData.destinationCityId,
          distanceKm: routeData.distanceKm,
          estimatedHours: routeData.estimatedHours,
          farePrice: routeData.farePrice,
          stops: stopsString
        });
        this.isFetching = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching route details:', err);
        this.errorMessage = 'Failed to load route data from server.';
        this.isFetching = false;
      }
    });
  }

  /**
   * 2. ON SUBMIT: Form submit hone par updated data backend par bhejna
   */
  onSubmit(): void {
    if (this.routeForm.invalid) {
      this.routeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValues = this.routeForm.value;

    // Stops ko string se array mein convert karna service ke mutabiq
    const stopsArray = formValues.stops
      ? formValues.stops.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      : [];

    // Form values mein stops ko array format mein update kar dein taaki service sahi map kare
    const finalFormValues = {
      ...formValues,
      stops: stopsArray
    };

    // Seedha form values pass karein, service khud hi mapToBackendPayload chala degi!
    this.routeService.updateRoute(this.routeId, finalFormValues).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/routes']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error updating route:', err);
        this.errorMessage = err.error?.message || 'Failed to update route on the server.';
        this.isLoading = false;
      }
    });
  }


}