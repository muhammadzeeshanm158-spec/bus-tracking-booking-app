import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RouteService } from '../../services/route.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add-route',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-route.component.html',
  styleUrl: './add-route.component.css'
})
export class AddRouteComponent {
  
  private fb = inject(FormBuilder);
  private routeService = inject(RouteService);
  private router = inject(Router);

  isLoading = false;        
  errorMessage = '';        

 

  // =========================================================================
  // REACTIVE FORM INITIALIZATION (Matching Form Controls & Validations)
  // =========================================================================
  routeForm: FormGroup = this.fb.group({
    routeName: ['', [Validators.required, Validators.minLength(3)]],
    sourceCityId: [null, [Validators.required]],
    destinationCityId: [null, [Validators.required]],
    distanceKm: [null, [Validators.required, Validators.min(1)]],
    estimatedHours: ['', [Validators.required]],
    stops: [''],
    farePrice: [null, [Validators.required, Validators.min(0)]],
    status: ['Active', [Validators.required]]
  });

  /**
   * ON SUBMIT: Form submit hone par validation check aur backend request bhejne ka function
   */
  onSubmit(): void {
    // Agar form invalid hai toh saare errors trigger kar ke process rok dein
    if (this.routeForm.invalid) {
      this.routeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValues = this.routeForm.value;

    // Convert comma-separated stops string into an array of strings (e.g., "Hyderabad, Nawabshah" -> ["Hyderabad", "Nawabshah"])
    const stopsArray = formValues.stops 
      ? formValues.stops.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      : [];

    // Final payload data tayyar karna with proper numeric casting for Pakistani route context
    const newRouteData = {
      ...formValues,
      sourceCityId: Number(formValues.sourceCityId),
      destinationCityId: Number(formValues.destinationCityId),
      distanceKm: Number(formValues.distanceKm),
      farePrice: Number(formValues.farePrice), // Currency will be handled as PKR in views
      stops: stopsArray
    };

    // RouteService ke zariye backend par naya route create karne ki request bhejna
    this.routeService.createRoute(newRouteData).subscribe({
      next: () => {
        this.isLoading = false;
        // Successful creation ke baad routes list par redirect karna
        this.router.navigate(['/routes']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error creating route:', err);
        this.errorMessage = err.error?.message || 'Failed to create route on server.';
        this.isLoading = false;
      }
    });
  }
}