import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RouteService } from '../../services/route.service';
import { Route } from '../../models/route.model';
import { HttpErrorResponse } from '@angular/common/http';

// Extension interface to safely handle MongoDB _id without using 'any'
interface RouteWithMongoId extends Route {
  _id?: string;
}

@Component({
  selector: 'app-route-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './route-list.component.html',
  styleUrl: './route-list.component.css'
})
export class RouteListComponent implements OnInit {
  
  private routeService = inject(RouteService);

  routes: Route[] = [];          
  isLoading = true;             
  errorMessage = '';            

  ngOnInit(): void {
    this.loadRoutes();
  }

  /**
   * 1. LOAD ROUTES: Server se tamam available routes fetch karna
   */
  loadRoutes(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.routeService.getAllRoutes().subscribe({
      next: (data: Route[]) => {
        this.routes = data;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching routes:', err);
        this.errorMessage = 'Failed to load routes from the server.';
        this.isLoading = false;
      }
    });
  }

  /**
   * SAFE ID HELPER: Strict typed function jo route ki id ya _id safely extract kare (No 'any')
   */
  getRouteId(route: Route): string | number {
    const routeWithId = route as RouteWithMongoId;
    return routeWithId.id ?? routeWithId._id ?? '';
  }

  /**
   * 2. DELETE ROUTE: Kisi specific route ko ID ke zariye delete karna
   */
  deleteRoute(id: string | number | undefined): void {
    if (!id) return;

    // Convert to string safely since deleteRoute expects string/id
    const stringId = String(id);

    if (confirm('Are you sure you want to delete this route?')) {
      this.routeService.deleteRoute(stringId).subscribe({
        next: () => {
          this.routes = this.routes.filter((route: Route) => {
            const currentRouteId = this.getRouteId(route);
            return currentRouteId !== id;
          });
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error deleting route:', err);
          alert('Failed to delete route.');
        }
      });
    }
  }
}