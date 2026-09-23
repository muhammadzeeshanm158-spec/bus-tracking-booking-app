import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RouteService } from '../../services/route.service';
import { Route } from '../../models/route.model';
import { HttpErrorResponse } from '@angular/common/http';

// Safe interface extension for MongoDB _id support (No 'any')
interface RouteWithMongoId extends Route {
  _id?: string;
}

@Component({
  selector: 'app-view-route',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view-route.component.html',
  styleUrl: './view-route.component.css'
})
export class ViewRouteComponent implements OnInit {
  
  private route = inject(ActivatedRoute);
  private routeService = inject(RouteService);

  routeData: Route | null = null;   
  isLoading = true;                 
  errorMessage = '';                

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) {
      this.fetchRouteDetails(routeId);
    } else {
      this.errorMessage = 'Invalid Route ID provided.';
      this.isLoading = false;
    }
  }

  /**
   * FETCH ROUTE DETAILS: Server se specific route ki ID ke zariye details lana
   */
  fetchRouteDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.routeService.getRouteById(id).subscribe({
      next: (data: Route) => {
        this.routeData = data;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching route details:', err);
        this.errorMessage = 'Failed to load route details from the server.';
        this.isLoading = false;
      }
    });
  }

  /**
   * SAFE ID HELPER: Strict typed function jo route ki id ya _id safely extract kare
   */
  getRouteId(): string | number {
    if (!this.routeData) return '';
    const routeWithId = this.routeData as RouteWithMongoId;
    return routeWithId.id ?? routeWithId._id ?? '';
  }
}